const fs = require('fs');
let code = fs.readFileSync('src/lib/commissionEngine.ts', 'utf8');

code = code.replace(
    /source: 'course' \| 'license' \| 'marketplace'/,
    "source: 'course' | 'ebook' | 'certification' | 'instructor_license' | 'expert_license' | 'marketplace' | 'premium_subscription' | 'p2p'"
);

fs.writeFileSync('src/lib/commissionEngine.ts', code);
