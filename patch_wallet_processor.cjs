const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/lib/walletProcessor.ts');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('processAmbassadorCommission')) {
    // Inject import at the top
    code = code.replace(
        "import { adminDb } from './firebaseAdmin.js';",
        "import { adminDb } from './firebaseAdmin.js';\nimport { processAmbassadorCommission } from './commissionEngine.js';"
    );

    // After course purchase success
    // Let's find where the course purchase transaction succeeds.
    // It's after: t.set(enrollmentRef, newEnrollment);
    
    code = code.replace(
        "t.set(enrollmentRef, newEnrollment);",
        "t.set(enrollmentRef, newEnrollment);\n\n    // Trigger commission in background (not blocking transaction)\n    setTimeout(() => {\n      processAmbassadorCommission({\n        transactionId: purchaseRef.id,\n        buyerId: studentId,\n        amount: clientPrice,\n        itemId: courseId,\n        source: 'course'\n      }).catch(console.error);\n    }, 0);"
    );

    // After license purchase success
    // find: t.set(licenseRef, newLicense);
    code = code.replace(
        "t.set(licenseRef, newLicense);",
        "t.set(licenseRef, newLicense);\n\n    // Trigger commission in background\n    setTimeout(() => {\n      processAmbassadorCommission({\n        transactionId: licenseRef.id,\n        buyerId,\n        amount: clientPrice,\n        itemId: 'instructor_license',\n        source: 'license'\n      }).catch(console.error);\n    }, 0);"
    );

    fs.writeFileSync(file, code);
    console.log("Wallet processor patched");
}
