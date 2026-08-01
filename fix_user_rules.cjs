const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'firestore.rules');
let code = fs.readFileSync(file, 'utf8');

const userRules = `
    match /users/{userId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.auth.uid == userId && !request.resource.data.keys().hasAny(['referredBy', 'referralCode', 'referredAt']);
      allow update: if isAdmin() || (isAuthenticated() && request.auth.uid == userId && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['referredBy', 'referralCode', 'referredAt'])));
      allow delete: if isAdmin();
`;

code = code.replace(
  /match \/users\/\{userId\} \{[\s\S]*?allow delete: if isAdmin\(\);/,
  userRules.trim()
);

fs.writeFileSync(file, code);
