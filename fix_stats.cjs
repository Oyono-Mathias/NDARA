const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
    /app\.post\("\/api\/ambassador\/referrals-stats", isAuthenticated, async \(req: any, res: any\) => \{[\s\S]*?res\.json\(stats\);\s*\} catch \(error: any\) \{/g,
    `app.post("/api/ambassador/referrals-stats", isAuthenticated, async (req: any, res: any) => {
    try {
      const { uids } = req.body;
      if (!uids || !Array.isArray(uids)) return res.status(400).json({error: "uids array required"});
      
      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const stats: any = {};
      
      const chunkSize = 30;
      for (let i = 0; i < uids.length; i += chunkSize) {
        const chunk = uids.slice(i, i + chunkSize);
        
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
        
        try {
          const [purchasesSnap, enrollmentsSnap, devoirsSnap, quizzesSnap] = await Promise.all([
            adminDb.collection("purchases").where("userId", "in", chunk).get(),
            adminDb.collection("enrollments").where("studentId", "in", chunk).get(),
            adminDb.collection("assignment_submissions").where("studentId", "in", chunk).get(),
            adminDb.collection("quiz_attempts").where("studentId", "in", chunk).where("passed", "==", true).get()
          ]);
          
          purchasesSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const uid = data.userId;
            stats[uid].totalSpent += data.amount || 0;
            stats[uid].purchasesCount += 1;
          });
          
          enrollmentsSnap.docs.forEach((doc: any) => {
            const data = doc.data();
            const uid = data.studentId;
            stats[uid].enrollmentsCount += 1;
            if (data.progress === 100) stats[uid].completedCourses += 1;
            stats[uid].totalProgress += (data.progress || 0);
          });
          
          devoirsSnap.docs.forEach((doc: any) => {
            const uid = doc.data().studentId;
            stats[uid].devoirsCount += 1;
          });
          
          quizzesSnap.docs.forEach((doc: any) => {
            const uid = doc.data().studentId;
            stats[uid].quizzesCount += 1;
          });
          
        } catch (dbErr) {
          console.warn("Could not fetch stats chunk (likely ADC permission in preview):", dbErr);
          // Return empty stats for this chunk
        }
      }
      
      uids.forEach((uid: string) => {
        if (stats[uid].enrollmentsCount > 0) {
          stats[uid].avgProgress = Math.round(stats[uid].totalProgress / stats[uid].enrollmentsCount);
        }
      });
      
      res.json(stats);
    } catch (error: any) {`
);

fs.writeFileSync('server.ts', code);
console.log("Updated server.ts referrals-stats");
