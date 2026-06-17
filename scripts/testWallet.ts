import { adminDb } from '../src/lib/firebaseAdmin';
import { depositFunds, purchaseCourseWithEscrow, requestPayout, processApprovedPayout } from '../src/lib/walletProcessor';
import { v4 as uuidv4 } from 'uuid';

async function runTests() {
  console.log('--- NDARA WALLET V2 INTEGRATION TEST ---');
  
  const testRunId = `test_${Date.now()}`;
  
  // Create mock users
  const students = Array.from({ length: 5 }, (_, i) => `${testRunId}_student_${i}`);
  const instructors = Array.from({ length: 2 }, (_, i) => `${testRunId}_instructor_${i}`);
  const ambassadors = Array.from({ length: 1 }, (_, i) => `${testRunId}_ambassador_${i}`);
  
  const allUsers = [...students, ...instructors, ...ambassadors];
  
  console.log('1. INITIALISATION DES COMPTES DE TEST');
  for (const uid of allUsers) {
    await adminDb.collection('users').doc(uid).set({
      email: `${uid}@test.ndara.io`,
      balance: 0,
      affiliateBalance: 0,
      pendingBalance: 0,
      pendingAffiliateBalance: 0,
      createdAt: new Date().toISOString()
    });
  }
  console.log('✅ Comptes créés.');

  console.log('\n2. TESTS DE CHARGE: DEPOTS CONCURRENTS & IDEMPOTENCE');
  // Send 10 identical deposit requests to one user to test idempotence
  const depositId = uuidv4();
  const duplicateDeposits = Array.from({ length: 10 }, () => 
    depositFunds(students[0], 50000, 'Test idempotence', depositId)
      .catch(e => ({ error: e.message }))
  );
  
  await Promise.all(duplicateDeposits);
  
  // Normal deposits for others (concurrent)
  const normalDeposits = allUsers.map(uid => 
    depositFunds(uid, 100000, 'Init wallet', uuidv4())
  );
  await Promise.all(normalDeposits);
  
  const s0 = (await adminDb.collection('users').doc(students[0]).get()).data();
  console.log(`Student 0 Balance: ${s0?.balance} (Expected: 150000 if idempotence worked)`);

  
  console.log('\n3. TESTS DE CHARGE: ACHATS DE COURS CONCURRENTS');
  // 20 concurrent purchases from the 5 students to instructor 0, via ambassador 0
  const coursePurchases = Array.from({ length: 20 }, (_, i) => {
    const studentId = students[i % 5];
    // @ts-ignore
    return purchaseCourseWithEscrow(studentId, 10000, 'course_test', 'Test Course', instructors[0], uuidv4(), ambassadors[0])
      .catch((e: Error) => { console.error("Achat fail:", e.message); return null; })
  });
  
  await Promise.all(coursePurchases);
  
  console.log('\n4. TESTS DE CHARGE: RETRAITS & REMBOURSEMENTS REJETES');
  // Instructor tries to withdraw from Main Balance, Ambassador from Affiliate
  const payoutReqs = await Promise.all([
    requestPayout(instructors[0], 25000, 'orange_money', '237600000000', 'mobile_money', uuidv4()),
    requestPayout(ambassadors[0], 10000, 'mtn_money', '237670000000', 'mobile_money', uuidv4())
  ]);
  
  const req1 = payoutReqs[0];
  const req2 = payoutReqs[1];
  
  if (req1 && req1.payoutRequestId) {
     // Admin rejects it! (Checking the refund mechanism to main balance)
     await processApprovedPayout(req1.payoutRequestId, 'rejected');
  }
  
  if (req2 && req2.payoutRequestId) {
     // Admin rejects it! (Checking the refund mechanism to affiliate balance)
     await processApprovedPayout(req2.payoutRequestId, 'rejected');
  }

  console.log('\n5. VERIFICATION DE COHERENCE (SNAPSHOT DE FIN)');
  for (const uid of allUsers) {
    const data = (await adminDb.collection('users').doc(uid).get()).data();
    console.log(`User ${uid}:`);
    console.log(` - Balance: ${data?.balance}`);
    console.log(` - Affiliate Balance: ${data?.affiliateBalance}`);
    console.log(` - Pending Balance: ${data?.pendingBalance}`);
    console.log(` - Pending Affiliate Balance: ${data?.pendingAffiliateBalance}`);
  }
  
  console.log('\n--- TESTS COMPLETED ---');
  process.exit(0);
}

runTests().catch(console.error);
