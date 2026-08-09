const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldClickRoute = `  app.post("/api/ambassador/click", async (req: any, res: any) => {
    try {
      const { adminDb, admin } = await import("./src/lib/firebaseAdmin.js");
      const FieldValue = admin.firestore.FieldValue;
      const { refCode, landingPage } = req.body;
      if (!refCode) return res.status(400).json({ error: 'No ref code' });
      
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      
      let ambassadorId = refCode;
      
      await adminDb.collection('affiliate_clicks').add({
        ambassadorId,
        referralCode: refCode,
        timestamp: FieldValue.serverTimestamp(),
        landingPage: landingPage || '/',
        userAgent,
        ip,
        converted: false
      });
      
      const ambRef = adminDb.collection('ambassadors').doc(ambassadorId);
      const ambDoc = await ambRef.get();
      if (ambDoc.exists) {
        await ambRef.update({
          totalClicks: FieldValue.increment(1)
        });
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error tracking click:', err);
      res.status(500).json({ error: err.message });
    }
  });`;

const newClickRoute = `  app.post("/api/ambassador/click", async (req: any, res: any) => {
    try {
      const { adminDb, admin } = await import("./src/lib/firebaseAdmin.js");
      const FieldValue = admin.firestore.FieldValue;
      const { refCode, landingPage } = req.body;
      if (!refCode) return res.status(400).json({ error: 'No ref code' });
      
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Non disponible";
      const userAgent = req.headers['user-agent'] || "Non disponible";
      
      const ambsQuery = await adminDb.collection('ambassadors').where('referralCode', '==', refCode).limit(1).get();
      
      if (!ambsQuery.empty) {
        const ambDoc = ambsQuery.docs[0];
        const ambassadorId = ambDoc.id;
        
        await adminDb.collection('affiliate_clicks').add({
          ambassadorId,
          referralCode: refCode,
          timestamp: FieldValue.serverTimestamp(),
          landingPage: landingPage || '/',
          userAgent,
          ip,
          converted: false
        });
        
        await ambDoc.ref.update({
          totalClicks: FieldValue.increment(1)
        });
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error tracking click:', err);
      res.status(500).json({ error: err.message });
    }
  });`;

code = code.replace(oldClickRoute, newClickRoute);
fs.writeFileSync('server.ts', code);
