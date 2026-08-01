const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const regex = /app\.post\('\/api\/notifications\/send', async \(req, res\) => \{/;
const replacement = `app.post('/api/admin/impersonate', async (req, res) => {
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

  app.post('/api/notifications/send', async (req, res) => {`;

if (content.includes("app.post('/api/admin/impersonate'")) {
    console.log("Already has impersonate route");
} else {
    content = content.replace(regex, replacement);
    fs.writeFileSync('server.ts', content);
    console.log("Impersonate route added");
}
