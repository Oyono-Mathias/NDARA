const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /app\.post\("\/api\/admin\/ambassadors\/migrate", async \(req: any, res: any\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: error\.message \}\);\n\s*\}\n\s*\}\);/;

const replacement = `app.post("/api/admin/ambassadors/migrate", isAuthenticated, async (req: any, res: any) => {
    // Add simple isAdmin check inside since isAdmin middleware might not be exported properly
    if (req.user.email !== 'oyonomathias@gmail.com' && req.user.role !== 'admin') {
       return res.status(403).json({ error: 'Unauthorized' });
    }
    
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
            name: userData.displayName || 'Utilisateur',
            email: userData.email || '',
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
      res.status(500).json({ error: error.message, warning: 'ADC permission denied in preview' });
    }
  });`;

code = code.replace(targetRegex, replacement);
fs.writeFileSync('server.ts', code);
