const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiRoute = `
  app.get("/api/gamification/leaderboard", async (req: any, res: any) => {
    try {
      const { period } = req.query; // Actually, we'll just return global for now, or calculate based on affiliate_transactions
      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      
      const statsSnap = await adminDb.collection("affiliate_statistics").orderBy("totalSales", "desc").limit(100).get();
      const leaderboard = [];
      
      for (const doc of statsSnap.docs) {
        const data = doc.data();
        const userSnap = await adminDb.collection("users").doc(doc.id).get();
        const userData = userSnap.exists ? userSnap.data() : {};
        
        leaderboard.push({
          uid: doc.id,
          displayName: userData.displayName || 'Anonyme',
          photoURL: userData.photoURL || null,
          totalVolume: data.totalSales || 0,
          totalCommission: data.totalCommission || 0,
          level: data.level || 'bronze',
          badges: data.badges || []
        });
      }
      
      res.json({ leaderboard });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
`;

code = code.replace('app.get("/api/ambassador/validate"', apiRoute + '\n  app.get("/api/ambassador/validate"');

fs.writeFileSync('server.ts', code);
