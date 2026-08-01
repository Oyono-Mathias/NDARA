const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'firestore.rules');
let code = fs.readFileSync(file, 'utf8');

const newRule = `
    match /ambassadors/{ambassadorId} {
      allow read: if isAdmin() || (isAuthenticated() && request.auth.uid == ambassadorId);
      allow write: if isAdmin();
    }
`;

if (!code.includes('match /ambassadors')) {
    code = code.replace(
        'match /users/{userId} {',
        newRule + '\n    match /users/{userId} {'
    );
    fs.writeFileSync(file, code);
    console.log("Firestore rules updated");
} else {
    console.log("Rule already exists");
}
