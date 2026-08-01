const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newRoute = `  app.post("/api/admin/video/drive-to-bunny", isAuthenticated, async (req: any, res: any) => {
    try {
      const { fileId, accessToken, fileName } = req.body;
      if (!fileId || !accessToken) return res.status(400).json({ error: "Missing parameters" });

      let apiKey = process.env.BUNNY_STREAM_API_KEY;
      let libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
      try {
        const { adminDb } = await import("./src/lib/firebaseAdmin.js");
        const confDoc = await adminDb.collection('settings').doc('global_config').get();
        if (confDoc.exists) {
            const data = confDoc.data() as any;
            if (data?.bunny_stream_api_key) apiKey = data.bunny_stream_api_key;
            if (data?.bunny_stream_library_id) libraryId = data.bunny_stream_library_id;
        }
      } catch(e: any) {}

      if (!apiKey || !libraryId) {
        return res.status(500).json({ error: "Configuration Bunny manquante sur le serveur." });
      }

      // 1. Create empty video in Bunny
      const createRes = await fetch(\`https://video.bunnycdn.com/library/\${libraryId}/videos\`, {
        method: "POST",
        headers: {
          "AccessKey": apiKey!,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: fileName || "Google Drive Video " + Date.now() })
      });

      if (!createRes.ok) {
        throw new Error("Failed to create video in Bunny Stream");
      }
      const bunnyData = await createRes.json();
      const videoId = bunnyData.guid;

      // 2. Fetch from Google Drive and stream to Bunny via their simple upload API (using fetch)
      // Note: for very large files > 1GB, TUS is recommended, but for server-to-server fetch works up to a limit.
      const driveRes = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media\`, {
        headers: { Authorization: \`Bearer \${accessToken}\` }
      });
      if (!driveRes.ok) throw new Error("Failed to fetch from Google Drive");

      // Upload to Bunny
      const uploadRes = await fetch(\`https://video.bunnycdn.com/library/\${libraryId}/videos/\${videoId}\`, {
        method: "PUT",
        headers: {
          "AccessKey": apiKey!,
          "Content-Type": "application/octet-stream"
        },
        body: driveRes.body as any,
        // @ts-ignore
        duplex: 'half'
      });

      if (!uploadRes.ok) throw new Error("Failed to upload to Bunny");

      res.json({ success: true, videoId, videoUrl: \`https://iframe.mediadelivery.net/play/\${libraryId}/\${videoId}\` });
    } catch (e: any) {
      console.error("Drive to Bunny error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/admin/video/bunny/create",`;

content = content.replace('  app.post("/api/admin/video/bunny/create",', newRoute);
fs.writeFileSync('server.ts', content);
