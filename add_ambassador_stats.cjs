const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'server.ts');
let code = fs.readFileSync(file, 'utf8');

const statsRoute = `
  app.post("/api/ambassador/referrals-stats", isAuthenticated, async (req: any, res: any) => {
    try {
      const { uids } = req.body;
      if (!uids || !Array.isArray(uids)) return res.status(400).json({error: "uids array required"});
  
      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const stats: any = {};
  
      // For a scalable approach, chunk uids if > 30 (Firestore in operator limit)
      // We will do one by one or chunk by 30
      const chunkSize = 30;
      for (let i = 0; i < uids.length; i += chunkSize) {
        const chunk = uids.slice(i, i + chunkSize);
        
        // Fetch all data for this chunk in parallel
        const [purchasesSnap, enrollmentsSnap, devoirsSnap, quizzesSnap] = await Promise.all([
          adminDb.collection("purchases").where("userId", "in", chunk).get(),
          adminDb.collection("enrollments").where("studentId", "in", chunk).get(),
          adminDb.collection("assignment_submissions").where("studentId", "in", chunk).get(),
          adminDb.collection("quiz_attempts").where("studentId", "in", chunk).where("passed", "==", true).get()
        ]);

        // Initialize stats object for chunk
        chunk.forEach((uid: string) => {
          stats[uid] = {
            totalSpent: 0,
            purchasesCount: 0,
            firstPurchase: null,
            lastPurchase: null,
            enrollmentsCount: 0,
            completedCourses: 0,
            avgProgress: 0,
            devoirsCount: 0,
            quizzesCount: 0,
            totalProgress: 0
          };
        });

        // Process purchases
        purchasesSnap.docs.forEach((doc: any) => {
           const data = doc.data();
           const uid = data.userId;
           if(stats[uid]) {
             stats[uid].totalSpent += data.amount || 0;
             stats[uid].purchasesCount += 1;
             const dDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
             if (!stats[uid].firstPurchase || dDate < stats[uid].firstPurchase) stats[uid].firstPurchase = dDate;
             if (!stats[uid].lastPurchase || dDate > stats[uid].lastPurchase) stats[uid].lastPurchase = dDate;
           }
        });
  
        // Process enrollments
        enrollmentsSnap.docs.forEach((doc: any) => {
           const data = doc.data();
           const uid = data.studentId;
           if(stats[uid]) {
             stats[uid].totalProgress += data.progress || 0;
             stats[uid].enrollmentsCount += 1;
             if (data.progress >= 100 || data.completed) stats[uid].completedCourses += 1;
           }
        });

        // Process devoirs
        devoirsSnap.docs.forEach((doc: any) => {
          const data = doc.data();
          const uid = data.studentId;
          if(stats[uid]) stats[uid].devoirsCount += 1;
        });

        // Process quizzes
        quizzesSnap.docs.forEach((doc: any) => {
          const data = doc.data();
          const uid = data.studentId;
          if(stats[uid]) stats[uid].quizzesCount += 1;
        });

        // Finalize averages
        chunk.forEach((uid: string) => {
          stats[uid].avgProgress = stats[uid].enrollmentsCount > 0 
            ? Math.round(stats[uid].totalProgress / stats[uid].enrollmentsCount) 
            : 0;
          delete stats[uid].totalProgress; // clean up
        });
      }
  
      res.json(stats);
    } catch(e: any) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });
`;

if (!code.includes('/api/ambassador/referrals-stats')) {
    code = code.replace(
        '  // Wallet Security API',
        statsRoute + '\n  // Wallet Security API'
    );
    fs.writeFileSync(file, code);
    console.log("Stats route added to server.ts");
} else {
    console.log("Route already exists");
}
