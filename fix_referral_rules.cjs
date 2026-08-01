const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'firestore.rules');
let code = fs.readFileSync(file, 'utf8');

const newRule = `
    match /referrals/{id} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorUid == request.auth.uid);
      allow write: if isAdmin();
    }
`;

if (!code.includes('match /referrals')) {
    code = code.replace(
        'match /users/{userId} {',
        newRule + '\n    match /users/{userId} {'
    );
    fs.writeFileSync(file, code);
    console.log("Firestore rules updated for referrals");
} else {
    console.log("Rule already exists");
}
