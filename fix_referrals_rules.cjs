const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
    /match \/referrals\/\{id\} \{\s*allow read: if isAdmin\(\) \|\| \(isAuthenticated\(\) && resource\.data\.ambassadorUid == request\.auth\.uid\);\s*allow write: if isAdmin\(\);\s*\}/,
    'match /referrals/{id} { allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorUid == request.auth.uid); allow write: if isAdmin() || (isAuthenticated() && request.resource.data.referralUid == request.auth.uid); }'
);

fs.writeFileSync('firestore.rules', code);
console.log("Updated referrals rule");
