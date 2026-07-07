const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

const lines = code.split('\n');

lines.splice(374, 4, '  const q = transactionsColl.where("status", "==", "pending");');

code = lines.join('\n');
fs.writeFileSync('src/lib/walletProcessor.ts', code);
