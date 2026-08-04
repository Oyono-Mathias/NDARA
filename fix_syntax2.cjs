const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

// Replace everything after wallet_history with a clean block
let lastIndex = code.lastIndexOf('match /wallet_history');
if (lastIndex !== -1) {
    let before = code.substring(0, lastIndex);
    let after = `    match /wallet_history/{id} {
      allow read: if isAuthenticated() && (resource.data.walletId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }
  }
}`;
    fs.writeFileSync('firestore.rules', before + after);
    console.log("Fixed for real!");
}
