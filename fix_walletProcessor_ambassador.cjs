const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

const oldBlock = `      // ---- AMBASSADOR REAL-TIME UPDATES ----
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
      // ----------------------------------------`;

const newBlock = `      // ---- AMBASSADOR REAL-TIME UPDATES ----
      const ambRef = serverDb.collection('ambassadors').doc(referrerId);
      const ambSnap = await transaction.get(ambRef);
      if (ambSnap.exists) {
        transaction.update(ambRef, {
          totalSales: (ambSnap.data().totalSales || 0) + 1,
          totalRevenue: (ambSnap.data().totalRevenue || 0) + finalPrice,
          totalCommission: (ambSnap.data().totalCommission || 0) + affiliateAmount,
          pendingBalance: (ambSnap.data().pendingBalance || 0) + affiliateAmount
        });
      }

      const affTxRef = serverDb.collection('affiliate_transactions').doc();
      transaction.set(affTxRef, {
        ambassadorId: referrerId,
        buyerId: studentId,
        courseId: courseId,
        instructorId: courseData.instructorId || '',
        orderId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        courseTitle: courseTitle,
        amount: finalPrice,
        commissionRate: config.affiliateRate,
        commissionAmount: affiliateAmount,
        platformAmount: finalPrice - finalSellerAmount - affiliateAmount,
        status: 'pending',
        createdAt: serverDb.collection('users').firestore.FieldValue.serverTimestamp() || creationTime
      });
      // ----------------------------------------`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/lib/walletProcessor.ts', code);
