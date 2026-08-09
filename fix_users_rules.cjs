const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
    /allow create: if isAuthenticated\(\) && request\.auth\.uid == userId && !request\.resource\.data\.keys\(\)\.hasAny\(\['referredBy', 'referralCode', 'referredAt'\]\);/,
    'allow create: if isAuthenticated() && request.auth.uid == userId;'
);
code = code.replace(
    /allow update: if isAuthenticated\(\) && request\.auth\.uid == userId && !request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasAny\(\['role', 'isAdmin', 'walletBalance', 'isAmbassador', 'referredBy'\]\);/,
    "allow update: if isAuthenticated() && request.auth.uid == userId && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isAdmin', 'walletBalance', 'isAmbassador']);"
);

fs.writeFileSync('firestore.rules', code);
console.log("Updated users rule");
