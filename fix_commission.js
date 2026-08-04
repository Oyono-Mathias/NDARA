const fs = require('fs');
let code = fs.readFileSync('src/lib/commissionEngine.ts', 'utf8');
code = code.replace(
  /await adminDb\.runTransaction\(async \(t\) => {/,
  'const { commissionAmount, percentage } = await adminDb.runTransaction(async (t) => {'
);
code = code.replace(
  /        updatedAt: FieldValue\.serverTimestamp\(\)\n        }\);\n      }\n    }\);\n\n    \/\/ We can also send internal notifications/,
  '        updatedAt: FieldValue.serverTimestamp()\n        });\n      }\n\n      return { commissionAmount, percentage };\n    });\n\n    // We can also send internal notifications'
);
fs.writeFileSync('src/lib/commissionEngine.ts', code);
