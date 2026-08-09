const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/match \/login_history\/\{id\} \{ allow read: if isAdmin\(\); allow create: if true; allow update, delete: if isAdmin\(\); \}/g, "match /login_history/{id} { allow read: if isAdmin(); allow write: if isAdmin(); }");
code = code.replace(/match \/affiliate_clicks\/\{id\} \{ allow read: if isAdmin\(\) \|\| \(isAuthenticated\(\) && resource\.data\.ambassadorId == request\.auth\.uid\); allow create: if true; allow update, delete: if isAdmin\(\); \}/g, "match /affiliate_clicks/{id} { allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorId == request.auth.uid); allow write: if isAdmin(); }");
code = code.replace(/match \/affiliate_registrations\/\{id\} \{ allow read: if isAdmin\(\) \|\| \(isAuthenticated\(\) && resource\.data\.ambassadorId == request\.auth\.uid\); allow create: if true; allow update, delete: if isAdmin\(\); \}/g, "match /affiliate_registrations/{id} { allow read: if isAdmin() || (isAuthenticated() && resource.data.ambassadorId == request.auth.uid); allow write: if isAdmin(); }");

fs.writeFileSync('firestore.rules', code);
