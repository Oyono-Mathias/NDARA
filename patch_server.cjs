const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const routes = `
  app.post("/api/user/track", isAuthenticated, async (req: any, res: any) => {
    try {
      const uid = req.user.uid;
      const email = req.user.email;
      
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      const now = admin.firestore.FieldValue.serverTimestamp();
      
      if (!userDoc.exists) {
        await userRef.set({
          email: email || '',
          displayName: req.user.name || 'Utilisateur',
          photoURL: req.user.picture || '',
          role: email === 'oyonomathias@gmail.com' ? 'admin' : 'student',
          walletBalance: 0,
          preferences: {},
          createdAt: now,
          lastLoginAt: now,
          ip: ip,
          userAgent: userAgent
        });
      } else {
        const updateData: any = {
          lastLoginAt: now,
          ip: ip,
          userAgent: userAgent
        };
        if (!userDoc.data().createdAt) {
          updateData.createdAt = now;
        }
        await userRef.update(updateData);
      }
      
      // Auto-create Ambassador profile
      const ambRef = db.collection('ambassadors').doc(uid);
      const ambDoc = await ambRef.get();
      if (!ambDoc.exists) {
        // Find if referred
        let referredBy = null;
        if (userDoc.exists && userDoc.data().referredBy) {
          referredBy = userDoc.data().referredBy;
        }
        
        await ambRef.set({
          uid: uid,
          email: email || '',
          name: req.user.name || (userDoc.exists ? userDoc.data().displayName : 'Utilisateur'),
          country: 'Non renseigné',
          clicks: 0,
          signups: 0,
          totalSales: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          level: 'bronze',
          badge: 'Débutant',
          status: 'active',
          referredBy: referredBy,
          createdAt: now,
          lastLoginAt: now
        });

        // Increment signups for the referring ambassador if applicable
        if (referredBy) {
          const referrerRef = db.collection('ambassadors').doc(referredBy);
          const referrerDoc = await referrerRef.get();
          if (referrerDoc.exists) {
            await referrerRef.update({
              signups: admin.firestore.FieldValue.increment(1)
            });
          }
        }
      } else {
        await ambRef.update({
          lastLoginAt: now,
          email: email || '',
          name: req.user.name || (userDoc.exists ? userDoc.data().displayName : 'Utilisateur')
        });
      }
      
      // Login History
      await db.collection('login_history').add({
        uid,
        email,
        loginAt: now,
        ip,
        userAgent
      });
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error tracking user login:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ambassador/click", async (req: any, res: any) => {
    try {
      const { refCode, landingPage } = req.body;
      if (!refCode) return res.status(400).json({ error: 'No ref code' });
      
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      
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

if (!code.includes('/api/user/track')) {
  code = code.replace('httpServer.listen(PORT', routes + '\n  httpServer.listen(PORT');
  fs.writeFileSync('server.ts', code);
}
