const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

// Fix exists()
code = code.replace(/\.exists\(\)/g, ".exists");

// Fix addDoc(col, data) left over
code = code.replace(/addDoc\(([^,]+),\s*(\{[\s\S]*?\})\)/g, "$1.add($2)");

// Fix query(col, where(...))
// query(serverDb.collection('enrollments'), where('studentId', '==', studentId), where('courseId', '==', courseId))
code = code.replace(/query\(([^,]+),\s*where\([^)]+\),\s*where\([^)]+\)\)/g, (match) => {
    // Actually simpler to just manually regex
    return match;
});

// Since the TS errors tell me where they are, I can use them to fix.
// src/lib/walletProcessor.ts(8,11): error TS2304: Cannot find name 'addDoc'.
// src/lib/walletProcessor.ts(125,17): error TS2304: Cannot find name 'query'.
// src/lib/walletProcessor.ts(375,13): error TS2304: Cannot find name 'query'.
fs.writeFileSync('src/lib/walletProcessor.ts', code);
