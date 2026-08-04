import { adminDb } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

export async function processAmbassadorRewards(ambassadorUid: string) {
  try {
    const ambRef = adminDb.collection('affiliate_statistics').doc(ambassadorUid);
    const ambSnap = await ambRef.get();
    if (!ambSnap.exists) return;
    
    const ambData = ambSnap.data() || {};
    
    // Instead of computing all, they might already be tracked in affiliate_statistics
    // totalReferrals, totalAffiliateRevenue, totalSalesCount
    
    const totalReferrals = ambData.totalReferrals || 0;
    const totalEarnings = ambData.totalAffiliateRevenue || 0;
    const totalSalesCount = ambData.totalSalesCount || 0;
    const totalVolume = ambData.totalSalesVolume || 0;

    // Process Levels
    const levelsSnap = await adminDb.collection('affiliate_levels').orderBy('minSalesAmount', 'desc').get();
    let newLevel = ambData.level || 'bronze';
    let newLevelDoc: any = null;
    
    for (const lDoc of levelsSnap.docs) {
      const l = lDoc.data();
      if (totalSalesCount >= (l.minSalesCount || 0) && totalVolume >= (l.minSalesAmount || 0) && totalReferrals >= (l.minReferrals || 0)) {
        newLevel = lDoc.id;
        newLevelDoc = l;
        break;
      }
    }

    if (newLevel !== (ambData.level || 'bronze')) {
      await ambRef.update({ level: newLevel, updatedAt: FieldValue.serverTimestamp() });
      if (newLevelDoc && newLevelDoc.bonusAmount > 0) {
        await grantReward(ambassadorUid, 'level_up', newLevelDoc.bonusAmount, `Niveau ${newLevelDoc.name} atteint`);
      }
    }

    // Process Badges
    const badgesSnap = await adminDb.collection('affiliate_badges').get();
    const earnedBadges = ambData.badges || [];
    let addedBadges = false;

    for (const bDoc of badgesSnap.docs) {
      const b = bDoc.data();
      if (!earnedBadges.includes(bDoc.id)) {
        let conditionMet = false;
        if (b.conditionType === 'referrals' && totalReferrals >= b.conditionValue) conditionMet = true;
        if (b.conditionType === 'sales_count' && totalSalesCount >= b.conditionValue) conditionMet = true;
        if (b.conditionType === 'earnings' && totalEarnings >= b.conditionValue) conditionMet = true;
        
        if (conditionMet) {
          earnedBadges.push(bDoc.id);
          addedBadges = true;
          if (b.bonusAmount > 0) {
            await grantReward(ambassadorUid, 'badge', b.bonusAmount, `Badge ${b.name} débloqué`);
          }
        }
      }
    }

    if (addedBadges) {
      await ambRef.update({ badges: earnedBadges, updatedAt: FieldValue.serverTimestamp() });
    }

    // Process Goals & Challenges
    const challengesSnap = await adminDb.collection('affiliate_challenges').get();
    const completedChallenges = ambData.challenges || [];
    let addedChallenges = false;

    for (const cDoc of challengesSnap.docs) {
      const c = cDoc.data();
      if (!completedChallenges.includes(cDoc.id)) {
        let conditionMet = false;
        if (c.conditionType === 'referrals' && totalReferrals >= c.conditionValue) conditionMet = true;
        if (c.conditionType === 'sales_count' && totalSalesCount >= c.conditionValue) conditionMet = true;
        
        if (conditionMet) {
          completedChallenges.push(cDoc.id);
          addedChallenges = true;
          if (c.bonusAmount > 0) {
            await grantReward(ambassadorUid, 'challenge', c.bonusAmount, `Défi accompli: ${c.title || c.name}`);
          }
        }
      }
    }
    
    if (addedChallenges) {
        await ambRef.update({ challenges: completedChallenges, updatedAt: FieldValue.serverTimestamp() });
    }

    // Update Leaderboard Cache
    const lbRef = adminDb.collection('affiliate_leaderboard').doc(ambassadorUid);
    const userDoc = await adminDb.collection('users').doc(ambassadorUid).get();
    
    await lbRef.set({
      uid: ambassadorUid,
      displayName: userDoc.data()?.displayName || 'Anonyme',
      photoURL: userDoc.data()?.photoURL || '',
      level: newLevel,
      totalSalesCount,
      totalVolume,
      totalEarnings,
      totalReferrals,
      updatedAt: FieldValue.serverTimestamp()
    });

  } catch (e) {
    console.error("Error processing ambassador rewards:", e);
  }
}

async function grantReward(ambassadorUid: string, type: string, amount: number, title: string) {
  try {
    await adminDb.collection('affiliate_rewards').add({
      userId: ambassadorUid,
      type,
      montant: amount,
      titre: title,
      description: title,
      statut: 'paid',
      date: FieldValue.serverTimestamp()
    });

    if (amount > 0) {
      await adminDb.runTransaction(async (transaction) => {
        const walletRef = adminDb.collection('wallets').doc(ambassadorUid);
        const walletDoc = await transaction.get(walletRef);
        
        let newBalance = amount;
        let totalEarned = amount;
        
        if (walletDoc.exists) {
          const data = walletDoc.data() || {};
          newBalance += (data.availableBalance || 0);
          totalEarned += (data.totalAffiliateRevenue || data.totalEarned || 0);
        }

        transaction.set(walletRef, {
          availableBalance: newBalance,
          totalAffiliateRevenue: totalEarned,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        
        const logRef = adminDb.collection('wallet_history').doc();
        transaction.set(logRef, {
          walletId: ambassadorUid,
          ambassadorId: ambassadorUid,
          type: 'bonus',
          amount,
          currency: 'XAF',
          description: title,
          status: 'completed',
          referenceId: 'SYS_BONUS_' + Date.now(),
          createdAt: FieldValue.serverTimestamp()
        });
      });
    }

    await adminDb.collection('notifications').add({
       userId: ambassadorUid,
       title: "Nouvelle Récompense !",
       message: title,
       type: "reward",
       isRead: false,
       createdAt: FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error("Error granting reward:", e);
  }
}
