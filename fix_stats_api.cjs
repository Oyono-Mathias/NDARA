const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiRoute = `
  app.get("/api/ambassador/realtime-stats", isAuthenticated, async (req: any, res: any) => {
    try {
      const uid = req.user.uid;
      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      
      const [clicksSnap, signupsSnap, transactionsSnap, walletSnap, statsSnap, leaderboardSnap] = await Promise.all([
        adminDb.collection("campaign_clicks").where("ambassadorId", "==", uid).count().get(),
        adminDb.collection("referrals").where("ambassadorUid", "==", uid).count().get(),
        adminDb.collection("affiliate_transactions").where("ambassadorId", "==", uid).where("status", "in", ["validated", "paid", "pending"]).get(),
        adminDb.collection("wallets").doc(uid).get(),
        adminDb.collection("affiliate_statistics").doc(uid).get(),
        adminDb.collection("affiliate_leaderboard").orderBy("totalVolume", "desc").get()
      ]);

      const clicksCount = clicksSnap.data().count;
      const signupsCount = signupsSnap.data().count;
      const transactions = transactionsSnap.docs.map((d: any) => d.data());
      
      const purchasesCount = transactions.length;
      const conversionRate = clicksCount > 0 ? (signupsCount / clicksCount) * 100 : 0;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const curr = new Date();
      const first = curr.getDate() - curr.getDay(); 
      const week = new Date(curr.setDate(first));
      week.setHours(0,0,0,0);
      
      const month = new Date(now.getFullYear(), now.getMonth(), 1);

      let revenueToday = 0;
      let revenueWeek = 0;
      let revenueMonth = 0;
      let totalRevenue = 0;

      transactions.forEach((t: any) => {
        if (!t.createdAt) return;
        const date = t.createdAt.toDate();
        const amount = t.commission || 0;
        
        totalRevenue += amount;
        if (date >= today) revenueToday += amount;
        if (date >= week) revenueWeek += amount;
        if (date >= month) revenueMonth += amount;
      });

      const wallet = walletSnap.exists ? walletSnap.data() : { availableBalance: 0, pendingBalance: 0, totalWithdrawn: 0 };
      const stats = statsSnap.exists ? statsSnap.data() : { level: 'bronze', badges: [] };
      
      const rankIndex = leaderboardSnap.docs.findIndex((d: any) => d.id === uid);
      const rank = rankIndex !== -1 ? rankIndex + 1 : null;

      res.json({
        clicksCount,
        signupsCount,
        purchasesCount,
        conversionRate,
        revenueToday,
        revenueWeek,
        revenueMonth,
        totalRevenue,
        availableBalance: wallet.availableBalance || 0,
        pendingBalance: wallet.pendingBalance || 0,
        withdrawnBalance: wallet.totalWithdrawn || 0, // Using totalWithdrawn
        level: stats.level || 'bronze',
        badge: stats.badges?.[0] || null,
        rank
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });
`;

code = code.replace('app.get("/api/ambassador/validate"', apiRoute + '\n  app.get("/api/ambassador/validate"');

fs.writeFileSync('server.ts', code);
