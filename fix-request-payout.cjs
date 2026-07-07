const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');
const lines = code.split('\n');

// 451 to 460
lines.splice(451, 10,
    "    let payoutReqRef;",
    "    if (payoutId) {",
    "      payoutReqRef = serverDb.collection('payout_requests').doc(payoutId);",
    "      const existingReq = await transaction.get(payoutReqRef);",
    "      if (!existingReq.exists) throw new Error('Payout request not found');",
    "    } else {",
    "      payoutReqRef = serverDb.collection('payout_requests').doc();",
    "    }"
);

code = lines.join('\n');
fs.writeFileSync('src/lib/walletProcessor.ts', code);
