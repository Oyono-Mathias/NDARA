const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// Replace the match /ambassadors/{id} line
rules = rules.replace(/match \/ambassadors\/\{id\} \{.*?\}\n/g, '');

const newRules = `
    match /ambassadors/{id} {
      allow read: if true;
      allow create: if isAdmin();
      allow update: if isAdmin() || (isAuthenticated() && request.auth.uid == id && !request.resource.data.diff(resource.data).affectedKeys().hasAny(["totalClicks", "totalRegistrations", "totalSales", "totalRevenue", "totalCommission", "availableBalance", "pendingBalance", "withdrawnAmount", "level", "badge", "status"]));
      allow delete: if isAdmin();
    }
`;

// Insert it somewhere
rules = rules.replace('match /question_bank', newRules + '    match /question_bank');
fs.writeFileSync('firestore.rules', rules);
