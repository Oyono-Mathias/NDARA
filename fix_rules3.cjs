const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
    /match \/ambassadors\/\{id\} \{ allow read: if isAdmin\(\) \|\| \(isAuthenticated\(\) && request\.auth\.uid == id\); allow write: if isAdmin\(\); \}/,
    'match /ambassadors/{id} { allow read: if true; allow write: if isAdmin(); }'
);

fs.writeFileSync('firestore.rules', code);
console.log("Updated ambassadors rule");
