const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

let lastIndex = code.lastIndexOf('match /wallet_history');
if (lastIndex !== -1) {
    let blockStart = code.indexOf('{', lastIndex);
    let blockEnd = code.indexOf('}', blockStart);
    // Find the next }
    let nextBrace = code.indexOf('}', blockEnd + 1);
    code = code.substring(0, nextBrace + 1) + "\n  }\n}\n";
    fs.writeFileSync('firestore.rules', code);
    console.log("Fixed!");
}
