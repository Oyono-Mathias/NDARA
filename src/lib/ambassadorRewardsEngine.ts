import { adminDb } from './firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

export async function processAmbassadorRewards(ambassadorUid: string) {
  try {
    const ambRef = adminDb.collection('ambassadors').doc(ambassadorUid);
    const ambSnap = await ambRef.get();
    if (!ambSnap.exists) return;
    const ambData = ambSnap.data() || {};

    const childrenSnap = await adminDb.collection('users').where('referredBy', '==', ambData.referralCode || '').get();
    const totalReferrals = childrenSnap.size;

    const commSnap = await adminDb.collection('wallet_logs')
      .where('ambassadorUid', '==', ambassadorUid)
      .where('type', '==', 'commission')
      .get();
    
    const totalSalesCount = commSnap.size;
    let totalEarnings = 0;
    commSnap.forEach(d => totalEarnings += (d.data().amount || 0));

    const totalVolume = ambData.totalSales || 0;

    // Process Levels
    const levelsSnap = await adminDb.collection('ambassador_levels').orderBy('minSalesAmount', 'desc').get();
    let newLevel = ambData.level || 'bronze';
    let newLevelDoc: any = null;

    for (const lDoc of levelsSnap.docs) {
      const l = lDoc.data();
      if (totalSalesCount >= (l.minSalesCount || 0) && totalVolume >= (l.minSalesAmount || 0)) {
        newLevel = lDoc.id;
        newLevelDoc = l;
        break;
      }
    }

    if (newLevel !== (ambData.level || 'bronze')) {
      await ambRef.update({ level: newLevel });
      if (newLevelDoc && newLevelDoc.bonusAmount > 0) {
        await grantReward(ambassadorUid, 'level_up', newLevelDoc.bonusAmount, `Niveau ${newLevelDoc.name} atteint`);
      }
    }

    // Process Badges
    const badgesSnap = await adminDb.collection('ambassador_badges').get();
    const earnedBadges = ambData.badges || [];
    let addedBadges = false;

    for (const bDoc of badgesSnap.docs) {
      const b = bDoc.data();
      if (!earnedBadges.includes(bDoc.id)) {
        let conditionMet = false;
        if (b.conditionType === 'referrals' && totalReferrals >= b.conditionValue) conditionMet = true;
        if (b.conditionType === 'sales_count' && totalSalesCount >= b.conditionValue) conditionMet = true;
        if (b.conditionType === 'earnings' && totalEarnings >= b.conditionValue) conditionMet = true;
        if (b.conditionType === 'first_withdrawal' && (ambData.totalWithdrawn || 0) > 0) conditionMet = true;

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
      await ambRef.update({ badges: earnedBadges });
    }

    // Process Challenges (simplified logic)
    const challengesSnap = await adminDb.collection('ambassador_challenges').get();
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
            await grantReward(ambassadorUid, 'challenge', c.bonusAmount, `Défi accompli: ${c.name}`);
          }
        }
      }
    }
    
    if (addedChallenges) {
        await ambRef.update({ challenges: completedChallenges });
    }

    // Update Leaderboard Cache
    const lbRef = adminDb.collection('leaderboard_cache').doc(ambassadorUid);
    await lbRef.set({
      uid: ambassadorUid,
      displayName: ambData.displayName || 'Anonyme',
      photoURL: ambData.photoURL || '',
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

async function grantReward(ambassadorUid: string, type: string, amount: number, description: string) {
  try {
    await adminDb.collection('reward_history').add({
      ambassadorUid,
      type,
      amount,
      description,
      status: 'completed',
      createdAt: FieldValue.serverTimestamp()
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
          totalEarned += (data.totalEarned || 0);
        }

        transaction.set(walletRef, {
          availableBalance: newBalance,
          totalEarned: totalEarned,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        
        const logRef = adminDb.collection('wallet_logs').doc();
        transaction.set(logRef, {
          ambassadorUid,
          type: 'bonus',
          amount,
          description,
          status: 'completed',
          reference: 'SYS_BONUS_' + Date.now(),
          createdAt: FieldValue.serverTimestamp()
        });
      });
    }

    await adminDb.collection('notifications').add({
       userId: ambassadorUid,
       title: "Nouvelle Récompense !",
       message: description,
       type: "reward",
       read: false,
       createdAt: FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error("Error granting reward:", e);
  }
}
