const fs = require('fs');
let code = fs.readFileSync('src/views/auth/RegisterView.tsx', 'utf8');

// Add imports for Firestore
if (!code.includes("import { collection,")) {
    code = code.replace(/import { db } from '\.\.\/\.\.\/firebase';/g, "import { db } from '../../firebase';\nimport { collection, query, where, getDocs, limit, runTransaction, doc, getDoc, serverTimestamp, increment } from 'firebase/firestore';");
}

code = code.replace(
    /const validateReferralCode = async \(code: string\) => \{[\s\S]*?finally \{\s*setValidatingRef\(false\);\s*\}\s*\};/g,
    `const validateReferralCode = async (code: string) => {
    setValidatingRef(true);
    setRefError('');
    try {
      const q = query(collection(db, "ambassadors"), where("referralCode", "==", code), where("status", "==", "active"), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const ambData = snapshot.docs[0].data();
        const userSnap = await getDoc(doc(db, "users", ambData.uid));
        
        setRefValid(true);
        setAmbassadorName(userSnap.data()?.displayName || 'Ambassadeur');
      } else {
        setRefValid(false);
        setRefError("Code invalide ou expiré");
      }
    } catch (err) {
      console.error(err);
      setRefValid(false);
      setRefError("Erreur de validation");
    } finally {
      setValidatingRef(false);
    }
  };`
);

code = code.replace(
    /if \(refCode && refValid\) \{[\s\S]*?\} catch \(refErr\) \{/g,
    `if (refCode && refValid) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const user = auth.currentUser;
          if (user) {
            await runTransaction(db, async (transaction) => {
               const newUserId = user.uid;
               const userRef = doc(db, "users", newUserId);
               const userDoc = await transaction.get(userRef);
               
               if (userDoc.exists() && userDoc.data()?.referredBy) {
                   throw new Error("Cet utilisateur a déjà été parrainé");
               }
               
               const ambQuery = query(collection(db, "ambassadors"), where("referralCode", "==", refCode), where("status", "==", "active"), limit(1));
               const ambDocs = await getDocs(ambQuery); // getDocs outside transaction is fine for this use case
               if (ambDocs.empty) throw new Error("Code invalide");
               
               const ambDoc = ambDocs.docs[0];
               const ambData = ambDoc.data();
               const ambRef = doc(db, "ambassadors", ambData.uid); // use specific ref for transaction
               
               if (ambData.uid === newUserId) throw new Error("Auto-parrainage interdit");
               
               const referralRef = doc(collection(db, "referrals"));
               transaction.set(referralRef, {
                 ambassadorUid: ambData.uid,
                 referralUid: newUserId,
                 referralCode: refCode,
                 createdAt: serverTimestamp(),
                 status: 'active'
               });
               
               transaction.set(userRef, {
                 referredBy: ambData.uid,
                 referralCode: refCode,
                 referredAt: serverTimestamp()
               }, { merge: true });
               
               transaction.update(ambRef, {
                 totalReferrals: increment(1),
                 updatedAt: serverTimestamp()
               });
            });
          }
        } catch (refErr) {`
);

fs.writeFileSync('src/views/auth/RegisterView.tsx', code);
console.log("Updated RegisterView.tsx");
