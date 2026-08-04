import { Router } from "express";
import { adminDb, admin } from "../lib/firebaseAdmin.js";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const period = req.query.period as string || 'global';
    
    // We can query affiliate_transactions and group them, 
    // or if global we can just query affiliate_statistics.
    
    if (period === 'global') {
        const snap = await adminDb.collection('affiliate_statistics').get();
        const ambDocs = await adminDb.collection('ambassadors').get();
const uids = ambDocs.docs.map(d => d.id).slice(0, 30);
const usersSnap = uids.length > 0 ? await adminDb.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', uids).get() : { forEach: () => {} };
        const users = new Map();
        usersSnap.forEach(d => users.set(d.id, d.data()));
        
        let leaderboard = snap.docs.map(d => {
            const stat = d.data();
            const user = users.get(d.id) || {};
            const salesCount = stat.totalSalesCount || 0;
            const referrals = stat.totalReferrals || 0;
            const conversionRate = referrals > 0 ? ((salesCount / referrals) * 100).toFixed(1) : 0;
            return {
                id: d.id,
                displayName: user.displayName || 'Anonyme',
                photoURL: user.photoURL || '',
                country: user.country || 'Inconnu',
                level: stat.level || 'bronze',
                totalReferrals: referrals,
                totalSalesCount: salesCount,
                totalVolume: stat.totalSalesVolume || 0,
                totalEarnings: stat.totalAffiliateRevenue || 0,
                conversionRate: Number(conversionRate)
            };
        });
        
        leaderboard.sort((a, b) => b.totalVolume - a.totalVolume);
        return res.json({ leaderboard });
    }
    
    // For specific periods, query affiliate_transactions
    let startDate = new Date();
    startDate.setHours(0,0,0,0);
    
    if (period === 'today') {
        // already set
    } else if (period === 'week') {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
    } else if (period === 'month') {
        startDate.setDate(1);
    } else if (period === 'year') {
        startDate.setMonth(0, 1);
    }

    const txSnap = await adminDb.collection('affiliate_transactions')
        .where('createdAt', '>=', startDate)
        // status filter moved to memory to avoid composite index requirements
        .get();
        
    const statsMap = new Map();
    
    txSnap.forEach(d => {
        const tx = d.data();
        if (!['pending', 'validated', 'paid'].includes(tx.status)) return;
        const uid = tx.ambassadorUid;
        if (!statsMap.has(uid)) {
            statsMap.set(uid, { totalSalesCount: 0, totalVolume: 0, totalEarnings: 0 });
        }
        const s = statsMap.get(uid);
        if (tx.type === 'commission') {
            s.totalSalesCount += 1;
            s.totalVolume += (tx.amount || 0); // Assuming amount is the order amount
            s.totalEarnings += (tx.commission || 0);
        }
    });

    // Also get referrals in that period
    const usersSnap = await adminDb.collection('users')
        .where('createdAt', '>=', startDate)
        .get();
        
    usersSnap.forEach(d => {
        const u = d.data();
        if (u.referredBy) {
            // Find ambassador by code
            // Actually, we'd need a map of code -> uid
            // We'll skip exact referral count per period for performance, or fetch ambassadors first
        }
    });
    
    // Fetch all ambassadors to map codes and profiles
    const ambassadorsQuery = await adminDb.collection('ambassadors').get();
const ambUids = ambassadorsQuery.docs.map(d => d.id).slice(0, 30);
const ambSnap = ambUids.length > 0 ? await adminDb.collection('users').where(admin.firestore.FieldPath.documentId(), 'in', ambUids).get() : { forEach: () => {} };
    const ambMap = new Map();
    const codeToUid = new Map();
    
    ambSnap.forEach(d => {
        ambMap.set(d.id, d.data());
        if (d.data().referralCode) codeToUid.set(d.data().referralCode, d.id);
    });

    usersSnap.forEach(d => {
        const u = d.data();
        if (u.referredBy && codeToUid.has(u.referredBy)) {
            const uid = codeToUid.get(u.referredBy);
            if (!statsMap.has(uid)) {
                statsMap.set(uid, { totalSalesCount: 0, totalVolume: 0, totalEarnings: 0, totalReferrals: 0 });
            }
            statsMap.get(uid).totalReferrals = (statsMap.get(uid).totalReferrals || 0) + 1;
        }
    });

    let leaderboard = [];
    for (const [uid, s] of Array.from(statsMap.entries())) {
        const user = ambMap.get(uid) || {};
        const salesCount = s.totalSalesCount || 0;
        const referrals = s.totalReferrals || 0;
        const conversionRate = referrals > 0 ? ((salesCount / referrals) * 100).toFixed(1) : 0;

        leaderboard.push({
            id: uid,
            displayName: user.displayName || 'Anonyme',
            photoURL: user.photoURL || '',
            country: user.country || 'Inconnu',
            // For period, we don't have level, but we can fetch it or just omit
            level: 'bronze', 
            totalReferrals: referrals,
            totalSalesCount: salesCount,
            totalVolume: s.totalVolume,
            totalEarnings: s.totalEarnings,
            conversionRate: Number(conversionRate)
        });
    }

    leaderboard.sort((a, b) => b.totalVolume - a.totalVolume);
    res.json({ leaderboard });
    
  } catch (error) {
    console.error("Leaderboard error", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
