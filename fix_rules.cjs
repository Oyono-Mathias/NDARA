const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const missingRules = `
    match /login_history/{id} { allow read: if isAdmin(); allow create: if true; allow update, delete: if isAdmin(); }
    match /affiliate_clicks/{id} { allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorId == request.auth.uid); allow create: if true; allow update, delete: if isAdmin(); }
    match /affiliate_registrations/{id} { allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorId == request.auth.uid); allow create: if true; allow update, delete: if isAdmin(); }
`;

code = code.replace("  }\n}", missingRules + "  }\n}");
fs.writeFileSync('firestore.rules', code);
