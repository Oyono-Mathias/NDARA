const fs = require('fs');
let code = fs.readFileSync('src/lib/commissionEngine.ts', 'utf8');

if (!code.includes("import { processAmbassadorRewards }")) {
    code = "import { processAmbassadorRewards } from './ambassadorRewardsEngine.js';\n" + code;
}

if (!code.includes("processAmbassadorRewards(ambassadorUid);")) {
    code = code.replace(
        "return { success: true, commissionId };",
        "await processAmbassadorRewards(ambassadorUid).catch(e => console.error(e));\n    return { success: true, commissionId };"
    );
}
fs.writeFileSync('src/lib/commissionEngine.ts', code);
