import { processAmbassadorRewards } from './ambassadorRewardsEngine.js';
import { adminDb, admin } from "./firebaseAdmin.js";
const FieldValue = admin.firestore.FieldValue;

export async function processAmbassadorCommission(
  buyerId: string,
  amount: number,
  transactionId: string,
  itemId: string,
  source: 'course' | 'ebook' | 'certification' | 'instructor_license' | 'expert_license' | 'marketplace' | 'premium_subscription' | 'p2p'
) {
  try {
    // 1. Find if buyer was referred
    const referralsSnap = await adminDb.collection('referrals').where('referredUid', '==', buyerId).limit(1).get();
    if (referralsSnap.empty) return { success: false, reason: "No referral found" };
    
    const referralData = referralsSnap.docs[0].data();
    const ambassadorUid = referralData.ambassadorUid;
    
    if (!ambassadorUid) return { success: false, reason: "No ambassador uid" };

    // 2. Check ambassador status
    const ambassadorRef = adminDb.collection('ambassadors').doc(ambassadorUid);
    const ambassadorSnap = await ambassadorRef.get();
    if (!ambassadorSnap.exists) return { success: false, reason: "Ambassador not found" };
    
    const ambassadorData = ambassadorSnap.data();
    if (ambassadorData?.status !== 'active') return { success: false, reason: "Ambassador inactive or suspended" };

    // 3. Prevent duplicate commission
    const commissionId = transactionId; // Using transactionId ensures uniqueness
    const commissionRef = adminDb.collection('affiliate_transactions').doc(commissionId);
    
    // We will do a transaction to be absolutely safe
    let percentageOut = 0;
    let commissionAmountOut = 0;
    await adminDb.runTransaction(async (t) => {
      const commDoc = await t.get(commissionRef);
      if (commDoc.exists) {
        throw new Error("Commission already exists for this transaction");
      }

      // 4. Fetch commission settings
      const settingsRef = adminDb.collection('commission_settings').doc('default');
      const settingsSnap = await t.get(settingsRef);
      let percentage = 10; // Default 10%
      if (settingsSnap.exists) {
        const set = settingsSnap.data();
        if (source === 'course' && set?.courseCommission) percentage = set.courseCommission;
        else if (source === 'ebook' && set?.ebookCommission) percentage = set.ebookCommission;
        else if (source === 'certification' && set?.certificationCommission) percentage = set.certificationCommission;
        else if (source === 'instructor_license' && set?.instructorLicenseCommission) percentage = set.instructorLicenseCommission;
        else if (source === 'expert_license' && set?.expertLicenseCommission) percentage = set.expertLicenseCommission;
        else if (source === 'marketplace' && set?.marketplaceCommission) percentage = set.marketplaceCommission;
        else if (source === 'premium_subscription' && set?.premiumSubscriptionCommission) percentage = set.premiumSubscriptionCommission;
        else if (source === 'p2p' && set?.p2pCommission) percentage = set.p2pCommission;
        else if (source === 'course' && set?.referralCommission) percentage = set.referralCommission;
      }
      const rate = percentage / 100;
      const commissionAmount = Math.round(amount * rate);
      percentageOut = percentage;
      commissionAmountOut = commissionAmount;

      // 5. Create the commission in affiliate_transactions
      const newCommission = {
        id: commissionId,
        ambassadorId: ambassadorUid,
        buyerId: buyerId,
        courseId: itemId,
        orderId: transactionId,
        amount: amount,
        rate: rate,
        commission: commissionAmount,
        currency: 'XAF',
        status: 'validated', // Validated immediately because payment is confirmed
        createdAt: FieldValue.serverTimestamp(),
        validatedAt: FieldValue.serverTimestamp(),
        source
      };
      t.set(commissionRef, newCommission);

      // 6. Sync to Ambassador Wallet
      const walletRef = adminDb.collection('wallets').doc(ambassadorUid);
      const walletDoc = await t.get(walletRef);
      if (!walletDoc.exists) {
        t.set(walletRef, {
          walletId: ambassadorUid,
          ambassadorId: ambassadorUid,
          availableBalance: commissionAmount,
          pendingBalance: 0,
          totalAffiliateRevenue: commissionAmount,
          currency: 'XAF',
          updatedAt: FieldValue.serverTimestamp()
        });
      } else {
        t.update(walletRef, {
          availableBalance: FieldValue.increment(commissionAmount),
          totalAffiliateRevenue: FieldValue.increment(commissionAmount),
          updatedAt: FieldValue.serverTimestamp()
        });
      }

      // 7. Wallet History
      const walletHistoryRef = adminDb.collection('wallet_history').doc();
      t.set(walletHistoryRef, {
        walletId: ambassadorUid,
        ambassadorId: ambassadorUid,
        type: 'commission_credit',
        amount: commissionAmount,
        currency: 'XAF',
        status: 'completed',
        referenceId: commissionId,
        description: `Commission sur vente d'affiliation`,
        createdAt: FieldValue.serverTimestamp()
      });

      // 8. Affiliate Statistics
      const statsRef = adminDb.collection('affiliate_statistics').doc(ambassadorUid);
      const statsDoc = await t.get(statsRef);
      if (!statsDoc.exists) {
        t.set(statsRef, {
          totalSales: amount,
          totalCommission: commissionAmount,
          validatedCommission: commissionAmount,
          updatedAt: FieldValue.serverTimestamp()
        });
      } else {
        t.update(statsRef, {
          totalSales: FieldValue.increment(amount),
          totalCommission: FieldValue.increment(commissionAmount),
          validatedCommission: FieldValue.increment(commissionAmount),
          updatedAt: FieldValue.serverTimestamp()
        });
      }
    });

    // We can also send internal notifications or emails here
    const notificationRef = adminDb.collection('notifications').doc();
    // Try to send email
      try {
        const { sendEmail } = await import("./mailTransporter.js");
        const ambUser = await adminDb.collection('users').doc(ambassadorUid).get();
        if (ambUser.exists && ambUser.data()?.email) {
           await sendEmail(ambUser.data()?.email, "Nouvelle commission !", `Félicitations, vous avez reçu une commission de ${commissionAmountOut} XAF.`);
        }
      } catch(e) {}
      await notificationRef.set({
      userId: ambassadorUid,
      title: "Nouvelle commission !",
      message: `Vous avez reçu une commission de ${commissionAmountOut} XAF.`,
      type: "commission",
      isRead: false,
      createdAt: FieldValue.serverTimestamp()
    });

    await processAmbassadorRewards(ambassadorUid).catch(e => console.error(e));
    return { success: true, commissionId };
  } catch (error: any) {
    console.error("Commission Engine Error:", error);
    return { success: false, reason: error.message };
  }
}

export async function cancelAmbassadorCommission(transactionId: string) {
  try {
    const commissionId = transactionId;
    const commissionRef = adminDb.collection('affiliate_transactions').doc(commissionId);
    
    let percentageOut = 0;
    let commissionAmountOut = 0;
    await adminDb.runTransaction(async (t) => {
      const commDoc = await t.get(commissionRef);
      if (!commDoc.exists) return; // Nothing to cancel
      
      const data = commDoc.data();
      if (data?.status === 'cancelled' || data?.status === 'refunded') return;
      
      const ambassadorUid = data!.ambassadorId;
      const commissionAmount = data!.commission;
      const oldStatus = data!.status;

      
      // Notifications
      const notificationRef = adminDb.collection('notifications').doc();
      t.set(notificationRef, {
        userId: ambassadorUid,
        title: "Commission annulée",
        message: `Votre commission de ${commissionAmountOut} XAF a été annulée.`,
        type: "commission_cancellation",
        isRead: false,
        createdAt: FieldValue.serverTimestamp()
      });
      // Try to send email
      try {
        const { sendEmail } = await import("./mailTransporter.js");
        const ambUser = await adminDb.collection('users').doc(ambassadorUid).get();
        if (ambUser.exists && ambUser.data()?.email) {
           await sendEmail(ambUser.data()?.email, "Commission annulée", `Votre commission de ${commissionAmountOut} XAF a été annulée.`);
        }
      } catch(e) {}
      
      // 1. Update commission status
      t.update(commissionRef, {
        status: 'cancelled', // can also be 'refunded'
        cancelledAt: FieldValue.serverTimestamp()
      });

      // 2. Adjust stats
      const statsRef = adminDb.collection('affiliate_statistics').doc(ambassadorUid);
      const statsDoc = await t.get(statsRef);
      if (statsDoc.exists) {
        let updatePayload: any = {
          totalSales: FieldValue.increment(-data!.amount),
          totalCommission: FieldValue.increment(-commissionAmount),
          updatedAt: FieldValue.serverTimestamp()
        };
        if (oldStatus === 'validated') updatePayload.validatedCommission = FieldValue.increment(-commissionAmount);
        if (oldStatus === 'pending') updatePayload.pendingCommission = FieldValue.increment(-commissionAmount);
        if (oldStatus === 'paid') updatePayload.paidCommission = FieldValue.increment(-commissionAmount);
        t.update(statsRef, updatePayload);
      }

      // 3. Cancel from Wallet
      if (oldStatus === 'validated' || oldStatus === 'paid') {
        const walletRef = adminDb.collection('wallets').doc(ambassadorUid);
        const walletDoc = await t.get(walletRef);
        
        if (walletDoc.exists) {
            t.update(walletRef, {
                availableBalance: FieldValue.increment(-commissionAmount),
                totalAffiliateRevenue: FieldValue.increment(-commissionAmount),
                updatedAt: FieldValue.serverTimestamp()
            });
        }
        
        const walletHistoryRef = adminDb.collection('wallet_history').doc();
        t.set(walletHistoryRef, {
            walletId: ambassadorUid,
            ambassadorId: ambassadorUid,
            type: 'commission_cancellation',
            amount: -commissionAmount,
            currency: 'XAF',
            status: 'completed',
            referenceId: commissionId,
            description: `Annulation de commission`,
            createdAt: FieldValue.serverTimestamp()
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Cancel Commission Error:", error);
    return { success: false, reason: error.message };
  }
}
