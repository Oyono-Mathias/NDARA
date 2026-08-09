const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiRoute = `
  app.get("/api/ambassador/history", isAuthenticated, async (req: any, res: any) => {
    try {
      const uid = req.user.uid;
      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      
      const [clicksSnap, signupsSnap, txSnap, walletHistorySnap] = await Promise.all([
        adminDb.collection("campaign_clicks").where("ambassadorId", "==", uid).limit(50).get(),
        adminDb.collection("referrals").where("ambassadorUid", "==", uid).limit(50).get(),
        adminDb.collection("affiliate_transactions").where("ambassadorId", "==", uid).limit(50).get(),
        adminDb.collection("wallet_history").where("ambassadorId", "==", uid).limit(50).get()
      ]);

      const events = [];

      clicksSnap.docs.forEach((d: any) => {
        const data = d.data();
        if(data.createdAt) {
          events.push({ id: d.id, type: 'clic', date: data.createdAt.toDate(), data });
        }
      });

      signupsSnap.docs.forEach((d: any) => {
        const data = d.data();
        if(data.createdAt) {
          events.push({ id: d.id, type: 'inscription', date: data.createdAt.toDate(), data });
        }
      });

      txSnap.docs.forEach((d: any) => {
        const data = d.data();
        if(data.createdAt) {
          events.push({ id: d.id, type: 'achat', date: data.createdAt.toDate(), data, status: data.status });
          if(data.status === 'cancelled') {
             events.push({ id: d.id + '_cancel', type: 'annulation', date: data.cancelledAt?.toDate() || data.createdAt.toDate(), data });
          }
          if(data.status === 'refunded') {
             events.push({ id: d.id + '_refund', type: 'remboursement', date: data.cancelledAt?.toDate() || data.createdAt.toDate(), data });
          }
        }
      });

      walletHistorySnap.docs.forEach((d: any) => {
        const data = d.data();
        if(data.createdAt) {
          if (data.type === 'commission_credit') events.push({ id: d.id, type: 'commission', date: data.createdAt.toDate(), data });
          else if (data.type === 'withdrawal') events.push({ id: d.id, type: 'retrait', date: data.createdAt.toDate(), data });
          else if (data.type === 'commission_cancellation') events.push({ id: d.id, type: 'annulation_commission', date: data.createdAt.toDate(), data });
          else events.push({ id: d.id, type: data.type, date: data.createdAt.toDate(), data });
        }
      });

      events.sort((a, b) => b.date.getTime() - a.date.getTime());

      res.json({ events: events.slice(0, 100) });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
`;

code = code.replace('app.get("/api/ambassador/validate"', apiRoute + '\n  app.get("/api/ambassador/validate"');

fs.writeFileSync('server.ts', code);
