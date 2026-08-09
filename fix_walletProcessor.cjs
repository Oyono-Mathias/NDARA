const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

code = code.replace("const creationTime = new Date();\\n    const releaseTime = new Date(creationTime.getTime() + (14 * 24 * 60 * 60 * 1000));", "");
code = code.replace("if (referrerRef && referrerSnap) {", "const creationTime = new Date();\\n    const releaseTime = new Date(creationTime.getTime() + (14 * 24 * 60 * 60 * 1000));\\n    if (referrerRef && referrerSnap) {");

fs.writeFileSync('src/lib/walletProcessor.ts', code);
