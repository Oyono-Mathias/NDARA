const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("app.use('/uploads',", `
  app.get('/api/test-write', async (req, res) => {
    try {
      const { adminDb, admin } = await import("./src/lib/firebaseAdmin.js");
      await adminDb.collection('test_writes').add({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  });
  app.use('/uploads',`);
fs.writeFileSync('server.ts', code);
