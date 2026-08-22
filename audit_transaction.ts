import dotenv from 'dotenv';
dotenv.config();
import { adminDb } from './src/lib/firebaseAdmin.js';

async function audit() {
  console.log("=== DEBUT DE L'AUDIT DE PAIEMENT ===");
  const args = process.argv.slice(2);
  const userEmail = args[0] || 'oyonomathias@gmail.com';

  const usersRef = adminDb.collection('users');
  const snapshot = await usersRef.where('email', '==', userEmail).get();
  if (snapshot.empty) {
    console.log("❌ Utilisateur introuvable:", userEmail);
    return;
  }
  const userId = snapshot.docs[0].id;
  const userData = snapshot.docs[0].data();
  console.log(`✅ Utilisateur trouvé: ${userEmail} (UID: ${userId})`);

  // 1. Check Pending Payments
  const paymentsRef = adminDb.collection('pending_payments');
  const pSnap = await paymentsRef.where('userId', '==', userId).orderBy('createdAt', 'desc').limit(1).get();
  let txRef = null;
  let courseId = null;
  if (pSnap.empty) {
    console.log("❌ Aucun pending_payment récent trouvé pour cet utilisateur.");
  } else {
    const tx = pSnap.docs[0].data();
    txRef = pSnap.docs[0].id;
    courseId = tx.courseId;
    console.log(`✅ Transaction trouvée: ${txRef}`);
    console.log(`   - Statut: ${tx.status}`);
    console.log(`   - Montant: ${tx.amount} ${tx.currency}`);
    console.log(`   - Type: ${tx.type} (Course ID: ${tx.courseId || tx.licenseTier})`);
  }

  // 2. Check Course Unlock
  if (courseId) {
    const enrollmentsRef = adminDb.collection('enrollments');
    const eSnap = await enrollmentsRef.where('userId', '==', userId).where('courseId', '==', courseId).get();
    if (eSnap.empty) {
      console.log(`❌ L'accès à la formation (${courseId}) N'A PAS été débloqué.`);
    } else {
      console.log(`✅ Accès à la formation débloqué! (Document enrollment trouvé)`);
    }
  }

  // 3. Check Wallet & Commissions
  const walletRef = adminDb.collection('wallets').doc(userId);
  const wDoc = await walletRef.get();
  if (!wDoc.exists) {
    console.log("❌ Aucun wallet trouvé pour l'acheteur (normal s'il n'est pas ambassadeur, mais vérifions).");
  } else {
    console.log(`✅ Wallet Acheteur - Solde: ${wDoc.data()?.balance || 0}`);
  }

  // Check if a commission was generated for an ambassador
  const commRef = adminDb.collection('affiliate_transactions');
  const cSnap = await commRef.where('sourceUserId', '==', userId).orderBy('createdAt', 'desc').limit(1).get();
  if (cSnap.empty) {
    console.log(`ℹ️ Aucune commission générée (l'utilisateur n'a probablement pas utilisé de lien affilié).`);
  } else {
    const comm = cSnap.docs[0].data();
    console.log(`✅ Commission générée!`);
    console.log(`   - Bénéficiaire (Ambassadeur UID): ${comm.ambassadorId}`);
    console.log(`   - Montant de la commission: ${comm.amount}`);
    
    // Check ambassador wallet
    const ambWallet = await adminDb.collection('wallets').doc(comm.ambassadorId).get();
    if (ambWallet.exists) {
      console.log(`✅ Wallet Ambassadeur mis à jour - Nouveau solde: ${ambWallet.data()?.balance || 0}`);
    }
  }
  console.log("=== FIN DE L'AUDIT ===");
}
audit().catch(console.error).finally(() => process.exit(0));
