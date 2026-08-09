const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
    /match \/ambassadors\/\{id\} \{ allow read: if true; allow write: if isAdmin\(\) \|\| \(isAuthenticated\(\) && request\.auth\.uid == id\); \}/,
    'match /ambassadors/{id} { allow read: if true; allow update: if isAdmin() || (isAuthenticated() && (request.auth.uid == id || request.resource.data.diff(resource.data).affectedKeys().hasOnly(["totalReferrals", "updatedAt"]))); allow create, delete: if isAdmin() || (isAuthenticated() && request.auth.uid == id); }'
);

fs.writeFileSync('firestore.rules', code);
console.log("Updated ambassadors rule");
