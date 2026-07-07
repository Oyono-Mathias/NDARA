const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

// Fix freshTx which I blindly replaced with transaction
code = code.replace(/transaction\.status/g, 'txData.status');
code = code.replace(/transaction\.amount/g, 'txData.amount');
code = code.replace(/transaction\.type/g, 'txData.type');
code = code.replace(/transaction\.description/g, 'txData.description');
code = code.replace(/let transaction = /g, 'let txData = ');

// Line 456 is still QuerySnapshot. Why?
// Let's see: `const existingReq = await transaction.get(payoutReqRef);`
// In the script I had `payoutReqRef = serverDb.collection('payout_requests').doc(payoutId);`
// Wait, maybe the type of `payoutReqRef` is derived wrong?
code = code.replace(/const existingReq = await transaction\.get\(payoutReqRef\);/g, "const existingReq = await transaction.get(payoutReqRef as FirebaseFirestore.DocumentReference);");
code = code.replace(/if \(!existingReq\.exists\)/g, "if (!(existingReq as FirebaseFirestore.DocumentSnapshot).exists)");

fs.writeFileSync('src/lib/walletProcessor.ts', code);
