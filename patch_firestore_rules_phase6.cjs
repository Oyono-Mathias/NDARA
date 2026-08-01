const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'firestore.rules');
let code = fs.readFileSync(file, 'utf8');

const newRules = `
    match /ambassador_levels/{id} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
    match /ambassador_badges/{id} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
    match /ambassador_challenges/{id} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
    match /ambassador_rewards/{id} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
    match /reward_history/{id} { allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorUid == request.auth.uid); allow write: if isAdmin(); }
    match /leaderboard_cache/{id} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
`;

if (!code.includes('match /ambassador_levels')) {
    code = code.replace(
        'match /commission_settings/{id} {',
        newRules + '\n    match /commission_settings/{id} {'
    );
    fs.writeFileSync(file, code);
    console.log("Firestore rules updated for phase 6");
} else {
    console.log("Rules already updated");
}
