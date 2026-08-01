const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'firestore.rules');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    "match /ambassadors/{id} { allow read: if true; allow create: if isAuthenticated(); allow update: if isAdmin() || request.auth.uid == resource.data.userId; allow delete: if isAdmin(); }",
    "match /ambassadors/{id} { allow read: if isAdmin() || (isAuthenticated() && request.auth.uid == id); allow write: if isAdmin(); }"
);

fs.writeFileSync(file, code);
