const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const exportEndpoint = `
  // ==========================================
  // GOOGLE DRIVE EXPORT INTEGRATION
  // ==========================================
  app.post("/api/admin/drive/export", isAuthenticated, async (req: any, res: any) => {
    try {
      const { fileName, content, mimeType = 'text/plain' } = req.body;
      
      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      const configDoc = await adminDb.collection('settings').doc('global_config').get();
      const accessToken = configDoc.data()?.google_workspace_token;
      
      if (!accessToken) return res.status(401).json({ error: "Google Workspace token not configured" });

      const metadata = {
        name: fileName,
        mimeType
      };

      const boundary = 'foo_bar_baz';
      const requestBody = 
        '--' + boundary + '\\r\\n' +
        'Content-Type: application/json; charset=UTF-8\\r\\n\\r\\n' +
        JSON.stringify(metadata) + '\\r\\n' +
        '--' + boundary + '\\r\\n' +
        'Content-Type: ' + mimeType + '\\r\\n\\r\\n' +
        content + '\\r\\n' +
        '--' + boundary + '--';

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Content-Type': \`multipart/related; boundary=\${boundary}\`,
          'Content-Length': Buffer.byteLength(requestBody).toString()
        },
        body: requestBody
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error("Failed to upload to Drive: " + errText);
      }

      const data = await response.json();
      res.json({ success: true, fileId: data.id });
    } catch (error: any) {
      console.error("[Drive Export Error]:", error);
      res.status(500).json({ error: error.message || "Failed to export to Drive" });
    }
  });
`;

if (!code.includes('/api/admin/drive/export')) {
  code = code.replace(
    /\/\/ ==========================================\n\s*\/\/ GOOGLE CHAT INTEGRATION/,
    exportEndpoint + '\n\n  // ==========================================\n  // GOOGLE CHAT INTEGRATION'
  );
  fs.writeFileSync('server.ts', code);
  console.log("Drive export endpoint added.");
} else {
  console.log("Endpoint already exists.");
}
