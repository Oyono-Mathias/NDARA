import { db, auth } from './src/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, addDoc, getDoc } from 'firebase/firestore';

async function runSecurityTest() {
  console.log("Starting Security Test...");

  // We need a non-admin user
  let user;
  try {
    const cred = await createUserWithEmailAndPassword(auth, 'test_security@example.com', 'password123');
    user = cred.user;
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, 'test_security@example.com', 'password123');
      user = cred.user;
    } else {
      console.error("Auth error", e);
      return;
    }
  }

  const uid = user.uid;
  console.log("Logged in as", uid);

  let passed = 0;
  let total = 0;

  async function test(name: string, p: Promise<any>) {
    total++;
    try {
      await p;
      console.log(`❌ FAILED: ${name} (Operation succeeded but should have been denied)`);
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        console.log(`✅ PASSED: ${name} (Permission denied as expected)`);
        passed++;
      } else {
        console.log(`⚠️ UNKNOWN ERROR for ${name}:`, e.code);
      }
    }
  }

  // 1. augmenter son totalClicks (via update ambassadeur)
  await test("1. Augmenter totalClicks (ambassadors)", updateDoc(doc(db, 'ambassadors', uid), { totalClicks: 9999 }));

  // 2. augmenter son totalRegistrations
  await test("2. Augmenter totalRegistrations (ambassadors)", updateDoc(doc(db, 'ambassadors', uid), { totalRegistrations: 9999 }));

  // 3. créer une fausse affiliate_transaction
  await test("3. Créer une fausse affiliate_transaction", addDoc(collection(db, 'affiliate_transactions'), {
    ambassadorId: uid, amount: 50000, commission: 5000
  }));

  // 4. augmenter son wallet
  await test("4. Augmenter son wallet (wallets)", setDoc(doc(db, 'wallets', uid), { availableBalance: 999999 }));

  // 5. créer une fausse commission (similaire à 3)
  await test("5. Créer une fausse commission", setDoc(doc(db, 'affiliate_transactions', 'fake_comm'), { ambassadorId: uid }));

  // 6. modifier ambassadorId d'une transaction (update)
  await test("6. Modifier ambassadorId d'une transaction", updateDoc(doc(db, 'affiliate_transactions', 'fake_tx'), { ambassadorId: uid }));

  // 7. modifier commissionAmount
  await test("7. Modifier commissionAmount", updateDoc(doc(db, 'affiliate_transactions', 'fake_tx'), { commission: 100000 }));

  // 8. modifier availableBalance
  await test("8. Modifier availableBalance", updateDoc(doc(db, 'wallets', uid), { availableBalance: 100000 }));

  // 9. créer une fausse inscription
  await test("9. Créer une fausse inscription", addDoc(collection(db, 'affiliate_registrations'), { ambassadorId: uid, referredUserId: 'fake' }));

  // 10. modifier login_history
  await test("10. Modifier login_history", addDoc(collection(db, 'login_history'), { uid, ip: '127.0.0.1' }));

  console.log(`\nSecurity Test Results: ${passed}/${total} passed.`);
  process.exit(0);
}

runSecurityTest();
