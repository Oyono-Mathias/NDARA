const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'firestore.rules');
let code = fs.readFileSync(file, 'utf8');

const newRules = `
    match /wallets/{walletId} {
      allow read: if isAdmin() || (isAuthenticated() && request.auth.uid == walletId);
      allow write: if isAdmin();
    }
    match /withdraw_requests/{requestId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorUid == request.auth.uid);
      allow write: if isAdmin();
    }
    match /wallet_logs/{logId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorUid == request.auth.uid);
      allow write: if isAdmin();
    }
`;

if (!code.includes('match /wallets/{walletId}')) {
    code = code.replace(
        'match /commission_settings/{id} {',
        newRules + '\n    match /commission_settings/{id} {'
    );
    fs.writeFileSync(file, code);
    console.log("Firestore rules updated for wallets");
} else {
    console.log("Rules already updated");
}
