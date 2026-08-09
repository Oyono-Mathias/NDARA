const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorWallet.tsx', 'utf8');

code = code.replace(
    /where\('userId', '==', firebaseUser\?\.uid\),/g,
    "where('ambassadorUid', '==', firebaseUser?.uid),"
);

fs.writeFileSync('src/views/ambassador/AmbassadorWallet.tsx', code);
