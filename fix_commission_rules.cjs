const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'firestore.rules');
let code = fs.readFileSync(file, 'utf8');

const newRules = `
    match /commission_settings/{id} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    match /ambassador_commissions/{id} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorUid == request.auth.uid);
      allow write: if isAdmin();
    }
    match /commission_logs/{id} {
      allow read, write: if isAdmin();
    }
`;

if (!code.includes('match /ambassador_commissions')) {
    code = code.replace(
        'match /referrals/{id} {',
        newRules + '\n    match /referrals/{id} {'
    );
    fs.writeFileSync(file, code);
    console.log("Firestore rules updated for commissions");
} else {
    console.log("Commission rules already exist");
}
