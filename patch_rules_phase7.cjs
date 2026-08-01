const fs = require('fs');
const file = 'firestore.rules';
let code = fs.readFileSync(file, 'utf8');

const newRules = `
    // --- Phase 7 : Marketing Ambassadeurs ---
    match /marketing_assets/{id} { 
      allow read: if true; 
      allow write: if isAdmin(); 
    }
    match /ambassador_campaigns/{id} { 
      allow read: if isAuthenticated() && (resource.data.ambassadorId == request.auth.uid || isAdmin()); 
      allow create: if isAuthenticated() && request.resource.data.ambassadorId == request.auth.uid;
      allow update, delete: if isAuthenticated() && (resource.data.ambassadorId == request.auth.uid || isAdmin());
    }
    match /campaign_clicks/{id} { 
      allow read: if isAuthenticated() && (resource.data.ambassadorId == request.auth.uid || isAdmin()); 
      allow create: if true; 
      allow update, delete: if isAdmin(); 
    }
    match /campaign_conversions/{id} { 
      allow read: if isAuthenticated() && (resource.data.ambassadorId == request.auth.uid || isAdmin()); 
      allow create: if true; 
      allow update, delete: if isAdmin(); 
    }
    match /qr_codes/{id} { 
      allow read, write: if isAuthenticated() && (resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid || isAdmin()); 
    }
    match /short_links/{id} { 
      allow read: if true; 
      allow write: if isAuthenticated() && (resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid || isAdmin()); 
    }
`;

if (!code.includes('marketing_assets')) {
    code = code.replace(
        '  }\n}',
        newRules + '\n  }\n}'
    );
    fs.writeFileSync(file, code);
}
