const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const clickRoute = `
  app.post("/api/ambassador/click", async (req: any, res: any) => {
    try {
      const { refCode, landingPage } = req.body;
      if (!refCode) return res.status(400).json({ error: 'No ref code' });
      
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      
      // Find ambassador by code or uid
      let ambassadorId = refCode;
      
      await db.collection('affiliate_clicks').add({
        ambassadorId,
        referralCode: refCode,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        landingPage: landingPage || '/',
        userAgent,
        ip,
        converted: false
      });
      
      // Increment click count on ambassador
      const ambRef = db.collection('ambassadors').doc(ambassadorId);
      const ambDoc = await ambRef.get();
      if (ambDoc.exists) {
        await ambRef.update({
          clicks: admin.firestore.FieldValue.increment(1)
        });
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error tracking click:', err);
      res.status(500).json({ error: err.message });
    }
  });
`;

if (!code.includes('/api/ambassador/click')) {
  code = code.replace('app.listen(PORT', clickRoute + '\n  app.listen(PORT');
  fs.writeFileSync('server.ts', code);
}
