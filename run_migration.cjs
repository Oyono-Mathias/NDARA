const admin = require('firebase-admin');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
admin.initializeApp({ projectId: config.projectId });

async function migrate() {
    const db = admin.firestore(admin.app(), config.firestoreDatabaseId);
    const usersSnap = await db.collection("users").get();
      
    let migrated = 0;
    for (const doc of usersSnap.docs) {
      const userData = doc.data();
      const uid = doc.id;
      
      const ambRef = db.collection("ambassadors").doc(uid);
      const ambDoc = await ambRef.get();
      
      const referralCode = userData.referralCode || (ambDoc.exists ? ambDoc.data().referralCode : ('AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase()));
      const referralLink = "https://ndara.afrique/register?ref=" + referralCode;
      
      const now = admin.firestore.FieldValue.serverTimestamp();
      
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
        const updateData = {};
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
    console.log("Migrated " + migrated + " users.");
}
migrate().catch(console.error);
