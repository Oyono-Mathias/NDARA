const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorWallet.tsx', 'utf8');

code = code.replace(
    /const unsubWallet = onSnapshot\(collection\(db, 'wallets'\), \(snapshot\) => \{[\s\S]*?\}\);/g,
    `const unsubWallet = onSnapshot(doc(db, 'wallets', firebaseUser.uid), (docSnap) => {
       if (docSnap.exists()) {
          setWallet(docSnap.data());
       }
    });`
);

code = code.replace(/import \{ collection, query, where, getDocs, onSnapshot, orderBy, limit \} from 'firebase\/firestore';/, "import { collection, query, where, getDocs, onSnapshot, orderBy, limit, doc } from 'firebase/firestore';");

fs.writeFileSync('src/views/ambassador/AmbassadorWallet.tsx', code);
