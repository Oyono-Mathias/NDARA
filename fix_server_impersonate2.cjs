const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.post\("\/api\/chat",/;
const replacement = `app.post("/api/admin/impersonate", async (req: any, res: any) => {
    try {
      const { uid } = req.body;
      if (!uid) return res.status(400).json({ error: 'UID is required' });
      
      const { admin } = await import("./src/lib/firebaseAdmin.js");
      const customToken = await admin.auth().createCustomToken(uid);
      res.json({ token: customToken });
    } catch (e) {
      console.error('Impersonation error:', e);
      res.status(500).json({ error: 'Failed to create custom token' });
    }
  });

  app.post("/api/chat",`;

content = content.replace(regex, replacement);
fs.writeFileSync('server.ts', content);
