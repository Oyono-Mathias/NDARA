import { db, auth as clientAuth } from './src/firebase.js';
import { adminDb, admin } from './src/lib/firebaseAdmin.js';
import { signInWithCustomToken } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import fetch from 'node-fetch';
import { processAmbassadorCommission } from './src/lib/commissionEngine.js';

async function runFunctionalTest() {
  console.log("Starting Functional Test...");

  // 1. Create Ambassador A
  let userAId;
  try {
    const userARecord = await admin.auth().createUser({ email: 'ambassador_a@example.com', password: 'password123' });
    userAId = userARecord.uid;
  } catch (e: any) {
    userAId = (await admin.auth().getUserByEmail('ambassador_a@example.com')).uid;
  }
  
  // Track login A to create ambassador profile
  const customTokenA = await admin.auth().createCustomToken(userAId);
  await signInWithCustomToken(clientAuth, customTokenA);
  
  const tokenA = await clientAuth.currentUser?.getIdToken();
  await fetch('http://localhost:3000/api/user/track', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  
  // Get A's referral code
  const ambADoc = await adminDb.collection('ambassadors').doc(userAId).get();
  const refCodeA = ambADoc.data()?.referralCode;
  console.log(`Ambassador A (${userAId}) has ref code: ${refCodeA}`);

  // 2. User B clicks the link
  console.log("Simulating click by User B...");
  await fetch('http://localhost:3000/api/ambassador/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refCode: refCodeA, landingPage: '/courses' })
  });
  
  // Verify click was tracked
  const clicks = await adminDb.collection('affiliate_clicks').where('referralCode', '==', refCodeA).get();
  console.log(`Clicks for A: ${clicks.size}`);

  // 3. User B registers
  let userBId;
  try {
    const userBRecord = await admin.auth().createUser({ email: 'user_b@example.com', password: 'password123' });
    userBId = userBRecord.uid;
  } catch (e: any) {
    userBId = (await admin.auth().getUserByEmail('user_b@example.com')).uid;
  }

  // Pre-fill referredBy for user B since we can't easily simulate localstorage
  await adminDb.collection('users').doc(userBId).set({
    email: 'user_b@example.com',
    referredBy: refCodeA
  });

  // Track login B
  const customTokenB = await admin.auth().createCustomToken(userBId);
  await signInWithCustomToken(clientAuth, customTokenB);
  
  const tokenB = await clientAuth.currentUser?.getIdToken();
  await fetch('http://localhost:3000/api/user/track', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });

  // Check stats for A
  const ambA_afterReg = await adminDb.collection('ambassadors').doc(userAId).get();
  console.log(`A's totalRegistrations: ${ambA_afterReg.data()?.totalRegistrations}`);
  
  const userBDoc = await adminDb.collection('users').doc(userBId).get();
  console.log(`B's actual referredBy: ${userBDoc.data()?.referredBy}`);

  // 4. User B makes a purchase
  console.log("Simulating purchase by User B...");
  
  // The webhook or whatever calls processAmbassadorCommission
  const res = await processAmbassadorCommission(userBId, 50000, 'tx_abc123', 'course_123', 'course');
  console.log("Commission result:", res);

  // Check stats for A again
  const ambA_afterBuy = await adminDb.collection('ambassadors').doc(userAId).get();
  const aStats = await adminDb.collection('affiliate_statistics').doc(userAId).get();
  const aWallet = await adminDb.collection('wallets').doc(userAId).get();
  
  console.log(`A's totalSales (from stats, not ambassador directly yet unless webhook syncs it, wait our webhook does it)`);
  console.log(`Wallet Balance: ${aWallet.data()?.availableBalance}`);
  console.log(`Affiliate Stats - totalSales: ${aStats.data()?.totalSales}, totalCommission: ${aStats.data()?.totalCommission}`);
  
  process.exit(0);
}


runFunctionalTest();
