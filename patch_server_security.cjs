const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Fix /api/user/track
const trackTargetRegex = /app\.post\("\/api\/user\/track"[\s\S]*?res\.status\(500\)\.json\(\{ error: err\.message \}\);\n\s*\}\n\s*\}\);/;

const trackReplacement = `app.post("/api/user/track", isAuthenticated, async (req: any, res: any) => {
    try {
      const { adminDb, admin } = await import("./src/lib/firebaseAdmin.js");
      const FieldValue = admin.firestore.FieldValue;
      const uid = req.user.uid;
      const email = req.user.email;
      
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      if (ip && typeof ip === 'string' && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }
      const userAgent = req.headers['user-agent'] || null;
      
      const userRef = adminDb.collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      const now = FieldValue.serverTimestamp();
      
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
          lastLoginIp: ip || "IP non disponible en Preview",
          lastLoginUserAgent: userAgent || "Non disponible",
        });
      } else {
        const updateData: any = {
          lastLoginAt: now,
          lastLoginIp: ip || "IP non disponible en Preview",
          lastLoginUserAgent: userAgent || "Non disponible",
        };
        if (!userDoc.data().createdAt) {
          updateData.createdAt = now;
        }
        await userRef.update(updateData);
      }
      
      // Auto-create Ambassador profile
      const ambRef = adminDb.collection('ambassadors').doc(uid);
      const ambDoc = await ambRef.get();
      if (!ambDoc.exists) {
        let referredBy = null;
        if (userDoc.exists && userDoc.data().referredBy) {
          referredBy = userDoc.data().referredBy;
        }
        
        const referralCode = 'AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        await ambRef.set({
          uid: uid,
          referralCode: referralCode,
          referralLink: \`https://ndara.afrique/register?ref=\${referralCode}\`,
          email: email || '',
          name: req.user.name || (userDoc.exists ? userDoc.data().displayName : 'Utilisateur'),
          country: 'Non renseigné',
          totalClicks: 0,
          totalRegistrations: 0,
          totalSales: 0,
          totalRevenue: 0,
          totalCommission: 0,
          level: 'bronze',
          badge: 'Débutant',
          status: 'active',
          referredBy: referredBy,
          createdAt: now,
          lastLoginAt: now
        });
        if (referredBy) {
          // referredBy might be the referralCode or the UID.
          let referrerDoc;
          let referrerRef;
          
          if (referredBy.startsWith('AMB-')) {
             const qs = await adminDb.collection('ambassadors').where('referralCode', '==', referredBy).limit(1).get();
             if (!qs.empty) {
               referrerDoc = qs.docs[0];
               referrerRef = referrerDoc.ref;
             }
          } else {
             referrerRef = adminDb.collection('ambassadors').doc(referredBy);
             referrerDoc = await referrerRef.get();
          }
          
          if (referrerDoc && referrerDoc.exists) {
            const actualReferrerUid = referrerDoc.id;
            await referrerRef.update({
              totalRegistrations: FieldValue.increment(1)
            });
            
            // Register the affiliate registration event
            await adminDb.collection('affiliate_registrations').add({
              ambassadorId: actualReferrerUid,
              referredUserId: uid,
              referralCode: referrerDoc.data().referralCode || referredBy,
              createdAt: now
            });
            
            // Also update the user document to reflect the actual referredBy uid
            await userRef.update({ referredBy: actualReferrerUid, referralCode: referrerDoc.data().referralCode || referredBy });
            referredBy = actualReferrerUid;
          } else {
            referredBy = null;
          }
        }
      } else {
        await ambRef.update({
          lastLoginAt: now,
          email: email || '',
          name: req.user.name || (userDoc.exists ? userDoc.data().displayName : 'Utilisateur')
        });
      }
      
      await adminDb.collection('login_history').add({
        uid,
        email,
        loginAt: now,
        ip: ip || "IP non disponible en Preview",
        userAgent: userAgent || "Non disponible"
      });
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error tracking user login:', err);
      res.status(500).json({ error: err.message, warning: 'ADC permission denied in preview' });
    }
  });`;
  
code = code.replace(trackTargetRegex, trackReplacement);

// 2. Fix /api/ambassador/click
const clickTargetRegex = /app\.post\("\/api\/ambassador\/click"[\s\S]*?res\.status\(500\)\.json\(\{ error: err\.message \}\);\n\s*\}\n\s*\}\);/;

const clickReplacement = `app.post("/api/ambassador/click", async (req: any, res: any) => {
    try {
      const { adminDb, admin } = await import("./src/lib/firebaseAdmin.js");
      const FieldValue = admin.firestore.FieldValue;
      const { refCode, landingPage } = req.body;
      if (!refCode) return res.status(400).json({ error: 'No ref code' });
      
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      if (ip && typeof ip === 'string' && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }
      const userAgent = req.headers['user-agent'] || null;
      const now = FieldValue.serverTimestamp();
      
      const ambsQuery = await adminDb.collection('ambassadors').where('referralCode', '==', refCode).limit(1).get();
      if (!ambsQuery.empty) {
        const ambDoc = ambsQuery.docs[0];
        const ambassadorId = ambDoc.id;
        
        await adminDb.collection('affiliate_clicks').add({
          ambassadorId,
          referralCode: refCode,
          timestamp: now,
          landingPage: landingPage || '/',
          userAgent: userAgent || "Non disponible",
          ip: ip || "IP non disponible en Preview",
          converted: false
        });
        
        await ambDoc.ref.update({
          totalClicks: FieldValue.increment(1)
        });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error tracking ambassador click:', err);
      res.status(500).json({ error: err.message, warning: 'ADC permission denied in preview' });
    }
  });`;

code = code.replace(clickTargetRegex, clickReplacement);

fs.writeFileSync('server.ts', code);
