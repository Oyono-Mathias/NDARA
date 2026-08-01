const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf-8');

// Remove the lines I appended at the very end
content = content.replace(/    match \/wallet_holds\/\{id\}.*$/gm, '');
content = content.replace(/    match \/market_licenses\/\{id\}.*$/gm, '');
content = content.replace(/    match \/p2p_ads\/\{id\}.*$/gm, '');
content = content.replace(/    match \/p2p_disputes\/\{id\}.*$/gm, '');
content = content.replace(/    match \/p2p_transactions\/\{id\}.*$/gm, '');
content = content.replace(/    match \/mail\/\{id\}.*$/gm, '');

// Now inject before the last closing braces "  }\n}"
const extraRules = `
    match /wallet_holds/{id} { allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin()); allow write: if isAdmin(); }
    match /market_licenses/{id} { allow read: if true; allow write: if isAdmin(); }
    match /p2p_ads/{id} { allow read: if true; allow write: if isAdmin() || (isAuthenticated() && request.auth.uid == resource.data.sellerId); }
    match /p2p_disputes/{id} { allow read, write: if isAuthenticated(); }
    match /p2p_transactions/{id} { allow read, write: if isAuthenticated(); }
    match /mail/{id} { allow read, write: if isAdmin(); }
`;
content = content.replace(/  }\n}\n*$/, extraRules + "  }\n}\n");

fs.writeFileSync('firestore.rules', content);
