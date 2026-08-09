const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
    /match \/affiliate_transactions\/\{id\} \{\s*allow read: if isAuthenticated\(\) && \(resource\.data\.ambassadorUid == request\.auth\.uid \|\| isAdmin\(\)\);/g,
    "match /affiliate_transactions/{id} {\n      allow read: if isAuthenticated() && (resource.data.ambassadorUid == request.auth.uid || resource.data.ambassadorId == request.auth.uid || isAdmin());"
);

fs.writeFileSync('firestore.rules', code);
