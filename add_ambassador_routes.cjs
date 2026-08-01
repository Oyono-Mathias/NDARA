const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'server.ts');
let code = fs.readFileSync(file, 'utf8');

const newRoutes = `
  // --- AMBASSADOR API ---
  app.get("/api/ambassador/validate", async (req: any, res: any) => {
    try {
      const { code } = req.query;
      if (!code) return res.status(400).json({ error: "Code manquant" });

      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const snapshot = await adminDb.collection("ambassadors").where("referralCode", "==", code).where("status", "==", "active").limit(1).get();
      
      if (snapshot.empty) {
        return res.status(404).json({ error: "Code invalide ou expiré" });
      }

      const ambData = snapshot.docs[0].data();
      const userSnap = await adminDb.collection("users").doc(ambData.uid).get();
      const userData = userSnap.data();

      res.json({ 
        valid: true, 
        ambassadorName: userData?.displayName || 'Ambassadeur',
        ambassadorUid: ambData.uid 
      });
    } catch (error: any) {
      console.error("Erreur validation code", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/ambassador/process-referral", isAuthenticated, async (req: any, res: any) => {
    try {
      const { code } = req.body;
      const newUserId = req.user.uid;
      
      if (!code) return res.status(400).json({ error: "Code manquant" });

      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const adminFieldValues = (await import("./src/lib/firebaseAdmin.js")).admin.firestore.FieldValue;

      // Transaction pour sécurité maximale
      await adminDb.runTransaction(async (transaction: any) => {
        // 1. Vérifier si l'utilisateur a déjà un parrain
        const userRef = adminDb.collection("users").doc(newUserId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists && userDoc.data()?.referredBy) {
          throw new Error("Cet utilisateur a déjà été parrainé");
        }

        // 2. Chercher l'ambassadeur
        const ambQuery = await transaction.get(adminDb.collection("ambassadors").where("referralCode", "==", code).where("status", "==", "active").limit(1));
        if (ambQuery.empty) {
          throw new Error("Code invalide ou expiré");
        }
        
        const ambDoc = ambQuery.docs[0];
        const ambData = ambDoc.data();

        // Anti auto-parrainage
        if (ambData.uid === newUserId) {
          throw new Error("Auto-parrainage interdit");
        }

        // 3. Créer la relation
        const referralRef = adminDb.collection("referrals").doc();
        transaction.set(referralRef, {
          ambassadorUid: ambData.uid,
          referralUid: newUserId,
          referralCode: code,
          createdAt: adminFieldValues.serverTimestamp(),
          status: 'active'
        });

        // 4. Mettre à jour l'utilisateur
        transaction.set(userRef, {
          referredBy: ambData.uid,
          referralCode: code,
          referredAt: adminFieldValues.serverTimestamp()
        }, { merge: true });

        // 5. Incrémenter totalReferrals de l'ambassadeur
        transaction.update(ambDoc.ref, {
          totalReferrals: adminFieldValues.increment(1),
          updatedAt: adminFieldValues.serverTimestamp()
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Erreur process referral", error);
      res.status(400).json({ error: error.message || "Erreur lors du traitement" });
    }
  });
  // ------------------------
`;

if (!code.includes('/api/ambassador/validate')) {
  code = code.replace(
    '  // Wallet Security API',
    newRoutes + '\n  // Wallet Security API'
  );
  fs.writeFileSync(file, code);
  console.log("Routes added to server.ts");
} else {
  console.log("Routes already exist");
}
