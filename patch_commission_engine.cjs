const fs = require('fs');
const file = 'src/lib/commissionEngine.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('processAmbassadorRewards(')) {
    code = code.replace(
        'import { adminDb } from \'./firebaseAdmin.js\';',
        'import { adminDb } from \'./firebaseAdmin.js\';\nimport { processAmbassadorRewards } from \'./ambassadorRewardsEngine.js\';'
    );
    
    code = code.replace(
        'return { success: true, commissionId };',
        '// Trigger rewards engine asynchronously\n    processAmbassadorRewards(ambassadorUid).catch(console.error);\n\n    return { success: true, commissionId };'
    );
    fs.writeFileSync(file, code);
    console.log("Hooked into commissionEngine");
}
