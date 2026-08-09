const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  app.post("/api/admin/ambassadors/migrate", isAuthenticated, requireRole(["admin"]), async (req: any, res: any) => {
    try {
      const { adminDb, admin } = await import("./src/lib/firebaseAdmin.js");
      const FieldValue = admin.firestore.FieldValue;
      const usersSnap = await adminDb.collection("users").get();
      
      let migrated = 0;
      for (const doc of usersSnap.docs) {
        const userData = doc.data();
        const uid = doc.id;
        
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
            createdAt: userData.createdAt || now,
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
           await doc.ref.update({ referralCode });
        }
      }
      
      res.json({ success: true, migrated });
    } catch (error: any) {
      console.error('Migration error:', error);
      res.status(500).json({ error: error.message });
    }
  });`;

const replacement = `  app.post("/api/admin/ambassadors/migrate", isAuthenticated, requireRole(["admin"]), async (req: any, res: any) => {
    try {
      const { adminDb, adminAuth, admin } = await import("./src/lib/firebaseAdmin.js");
      const FieldValue = admin.firestore.FieldValue;
      const usersSnap = await adminDb.collection("users").get();
      
      let migrated = 0;
      for (const doc of usersSnap.docs) {
        const userData = doc.data();
        const uid = doc.id;
        
        // 1. Sync User data from Firebase Auth if missing createdAt or lastLoginAt
        let userUpdates: any = {};
        
        let authUser;
        try {
           authUser = await adminAuth.getUser(uid);
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
  });`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
