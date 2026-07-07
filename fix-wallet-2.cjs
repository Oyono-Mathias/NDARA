const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

// src/lib/walletProcessor.ts(125)
// const q = query(serverDb.collection('enrollments').where('instructorId', '==', receiverId));
code = code.replace(/const q = query\(serverDb\.collection\('enrollments'\)\.where\('instructorId', '==', receiverId\)\);/g, "const q = serverDb.collection('enrollments').where('instructorId', '==', receiverId);");

// src/lib/walletProcessor.ts(375)
// const txQuery = query(transactionsColl.orderBy('createdAt', 'desc').limit(10));
code = code.replace(/const txQuery = query\([^)]+\);/g, "const txQuery = transactionsColl.orderBy('createdAt', 'desc').limit(10);");

// src/lib/walletProcessor.ts(398)
// let total = 0; snap.forEach(doc => { total += doc.data().amount || 0; });
code = code.replace(/txSnap\.data\(\)/g, "txSnap.docs.map(d=>d.data())");

// src/lib/walletProcessor.ts(455)
// const payoutReqRef = doc(serverDb, 'payout_requests', requestId);
code = code.replace(/const payoutReqRef = doc\(serverDb, 'payout_requests', requestId\);/g, "const payoutReqRef = serverDb.collection('payout_requests').doc(requestId);");

// src/lib/walletProcessor.ts(458)
// if (reqSnap.empty) throw new Error('Payout request not found');
// wait, if it's transaction.get(payoutReqRef), it returns a DocumentSnapshot, NOT a QuerySnapshot!
// let's restore reqSnap to be DocumentSnapshot
code = code.replace(/reqSnap\.empty/g, "!reqSnap.exists");
code = code.replace(/reqSnap\.docs\[0\]\.data\(\)/g, "reqSnap.data()");
code = code.replace(/reqSnap\.docs\[0\]\.id/g, "reqSnap.id");

fs.writeFileSync('src/lib/walletProcessor.ts', code);
