const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  app.post("/api/admin/file/drive-to-storage", isAuthenticated, async (req: any, res: any) => {
    try {
      const { driveToken, fileId, fileName, folder = 'general', mimeType = 'application/octet-stream' } = req.body;
      if (!driveToken || !fileId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log("Fetching file from Drive:", fileId);
      const driveRes = await fetch(\`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media\`, {
        headers: { 'Authorization': \`Bearer \${driveToken}\` }
      });

      if (!driveRes.ok) {
        throw new Error("Failed to fetch from Drive: " + driveRes.statusText);
      }

      const { storageService } = await import("./src/lib/StorageService.js");
      const safeFileName = (fileName || 'file').replace(/[^a-zA-Z0-9.\\-]/g, '_');
      const uniqueName = \`\${folder}/\${Date.now()}-\${safeFileName}\`;
      
      const buffer = Buffer.from(await driveRes.arrayBuffer());
      const result = await storageService.uploadFile(buffer, uniqueName, mimeType);
      
      res.json({ success: true, publicUrl: result.url });
    } catch (error: any) {
      console.error("[Drive File Upload Error]:", error);
      res.status(500).json({ error: error.message || "Failed to transfer file from Drive" });
    }
  });
`;

if (!code.includes('/api/admin/file/drive-to-storage')) {
  code = code.replace(
    /app\.post\("\/api\/admin\/video\/drive-to-bunny"/,
    newEndpoint + '\n  app.post("/api/admin/video/drive-to-bunny"'
  );
  fs.writeFileSync('server.ts', code);
  console.log("Endpoint added.");
} else {
  console.log("Endpoint already exists.");
}
