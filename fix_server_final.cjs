const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the index of "app.use('/uploads',"
const uploadsIndex = code.indexOf("app.use('/uploads',");

if (uploadsIndex !== -1) {
    let cleanCode = code.substring(0, uploadsIndex + 73); // length of the app.use line
    
    cleanCode += `
  
  app.post("/api/admin/ambassadors/migrate", isAuthenticated, requireRole(["admin"]), async (req: any, res: any) => {
    try {
      const { adminDb, adminAuth, admin } = await import("./src/lib/firebaseAdmin.js");
      const FieldValue = admin.firestore.FieldValue;
      const usersSnap = await adminDb.collection("users").get();
      
      let migrated = 0;
      for (const doc of usersSnap.docs) {
        const userData = doc.data();
        const uid = doc.id;
        
        let userUpdates: any = {};
        
        let authUser;
        try {
           authUser = await admin.auth().getUser(uid);
        } catch(e) {
           console.log("Could not find user in auth: ", uid);
        }

        if (authUser) {
           if (!userData.createdAt && authUser.metadata.creationTime) {
              userUpdates.createdAt = admin.firestore.Timestamp.fromDate(new Date(authUser.metadata.creationTime));
           }
           if (!userData.lastLoginAt && authUser.metadata.lastSignInTime) {
              userUpdates.lastLoginAt = admin.firestore.Timestamp.fromDate(new Date(authUser.metadata.lastSignInTime));
           }
           if (!userData.email && authUser.email) {
              userUpdates.email = authUser.email;
           }
        }
        
        const ambRef = adminDb.collection("ambassadors").doc(uid);
        const ambDoc = await ambRef.get();
        
        const referralCode = userData.referralCode || (ambDoc.exists ? ambDoc.data().referralCode : ('AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase()));
        const referralLink = \`https://ndara.afrique/register?ref=\${referralCode}\`;
        
        const now = FieldValue.serverTimestamp();
        
        if (!ambDoc.exists) {
          await ambRef.set({
            uid,
            referralCode,
            referralLink,
            totalClicks: 0,
            totalRegistrations: 0,
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
            availableBalance: 0,
            pendingBalance: 0,
            withdrawnAmount: 0,
            level: 'bronze',
            status: 'active',
            createdAt: userUpdates.createdAt || userData.createdAt || now,
            updatedAt: now
          });
          migrated++;
        } else {
          const updateData: any = {};
          if (!ambDoc.data().referralCode) updateData.referralCode = referralCode;
          if (!ambDoc.data().referralLink) updateData.referralLink = referralLink;
          if (ambDoc.data().totalClicks === undefined) updateData.totalClicks = ambDoc.data().clicks || 0;
          if (ambDoc.data().totalRegistrations === undefined) updateData.totalRegistrations = ambDoc.data().signups || 0;
          if (ambDoc.data().totalSales === undefined) updateData.totalSales = ambDoc.data().totalSales || 0;
          if (ambDoc.data().totalRevenue === undefined) updateData.totalRevenue = ambDoc.data().totalRevenue || 0;
          if (ambDoc.data().totalCommission === undefined) updateData.totalCommission = ambDoc.data().totalCommissions || 0;
          if (ambDoc.data().availableBalance === undefined) updateData.availableBalance = 0;
          if (ambDoc.data().pendingBalance === undefined) updateData.pendingBalance = 0;
          if (ambDoc.data().withdrawnAmount === undefined) updateData.withdrawnAmount = 0;
          if (!ambDoc.data().level) updateData.level = 'bronze';
          
          if (Object.keys(updateData).length > 0) {
            updateData.updatedAt = now;
            await ambRef.update(updateData);
            migrated++;
          }
        }
        
        if (!userData.referralCode) {
           userUpdates.referralCode = referralCode;
        }
        
        if (Object.keys(userUpdates).length > 0) {
           await doc.ref.update(userUpdates);
        }
      }
      
      res.json({ success: true, migrated });
    } catch (error: any) {
      console.error('Migration error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/user/track", isAuthenticated, async (req: any, res: any) => {
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
          lastLoginIp: ip || "Non disponible dans cet environnement",
          lastLoginUserAgent: userAgent || "Non disponible",
        });
      } else {
        const updateData: any = {
          lastLoginAt: now,
          lastLoginIp: ip || "Non disponible dans cet environnement",
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
        ip: ip || "Non disponible",
        userAgent: userAgent || "Non disponible"
      });
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error tracking user login:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ambassador/click", async (req: any, res: any) => {
    try {
      const { adminDb, admin } = await import("./src/lib/firebaseAdmin.js");
      const FieldValue = admin.firestore.FieldValue;
      const { refCode, landingPage } = req.body;
      if (!refCode) return res.status(400).json({ error: 'No ref code' });
      
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Non disponible";
      if (ip && typeof ip === 'string' && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();
startCronJobs();
`;

    fs.writeFileSync('server.ts', cleanCode);
}
