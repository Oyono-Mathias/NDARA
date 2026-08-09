const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

const affiliateUpdateStr = `
    if (referrerRef && referrerSnap) {
      const referrerData = referrerSnap.data();
      const finalReferrerAffiliatePending = (referrerData.pendingAffiliateBalance || 0) + affiliateAmount;
      
      const affStats = referrerData.affiliateStats || { clicks: 0, registrations: 0, sales: 0, earnings: 0 };
      affStats.sales = (affStats.sales || 0) + 1;
      affStats.earnings = (affStats.earnings || 0) + affiliateAmount;
      
      transaction.update(referrerRef, {
        pendingAffiliateBalance: finalReferrerAffiliatePending,
        affiliateStats: affStats
      });

      // ---- AMBASSADOR REAL-TIME UPDATES ----
      const ambRef = serverDb.collection('ambassadors').doc(referrerId);
      const ambSnap = await transaction.get(ambRef);
      if (ambSnap.exists) {
        transaction.update(ambRef, {
          totalSales: (ambSnap.data().totalSales || 0) + 1,
          totalRevenue: (ambSnap.data().totalRevenue || 0) + finalPrice,
          totalCommissions: (ambSnap.data().totalCommissions || 0) + affiliateAmount
        });
      }

      const affTxRef = serverDb.collection('affiliate_transactions').doc();
      transaction.set(affTxRef, {
        ambassadorId: referrerId,
        buyerId: studentId,
        courseId: courseId,
        courseTitle: courseTitle,
        amount: finalPrice,
        commission: affiliateAmount,
        status: 'pending',
        createdAt: creationTime
      });
      // ----------------------------------------
    }
`;

// Replace the old block
code = code.replace(
  /if \(referrerRef && referrerSnap\) \{\s*const referrerData = referrerSnap\.data\(\);\s*const finalReferrerAffiliatePending = \(referrerData\.pendingAffiliateBalance \|\| 0\) \+ affiliateAmount;[\s\S]*?pendingAffiliateBalance: finalReferrerAffiliatePending,\s*affiliateStats: affStats\s*\}\);\s*\}/,
  affiliateUpdateStr.trim()
);

fs.writeFileSync('src/lib/walletProcessor.ts', code);
