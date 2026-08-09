const fs = require('fs');

// Fix server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/const \{ adminDb, FieldValue \} = await import\("\.\/src\/lib\/firebaseAdmin\.js"\);/g, 'const { adminDb, admin } = await import("./src/lib/firebaseAdmin.js");\\n      const FieldValue = admin.firestore.FieldValue;');
fs.writeFileSync('server.ts', serverCode);

// Fix walletProcessor.ts
let walletCode = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');
// Remove the second declaration of creationTime and releaseTime
walletCode = walletCode.replace(/const creationTime = new Date\(\);\n    const releaseTime = new Date\(creationTime\.getTime\(\) \+ \(14 \* 24 \* 60 \* 60 \* 1000\)\);\n    \n    const studentTx/g, 'const studentTx');
fs.writeFileSync('src/lib/walletProcessor.ts', walletCode);
