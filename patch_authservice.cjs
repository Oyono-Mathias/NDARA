const fs = require('fs');

let code = fs.readFileSync('src/services/authService.ts', 'utf8');

if (!code.includes("import { doc, setDoc, serverTimestamp } from 'firebase/firestore';")) {
  code = code.replace(
    "import { collection, addDoc } from 'firebase/firestore';",
    "import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';"
  );
}

const originalRegister = `
    // Créer le document utilisateur dans Firestore
    await UsersService.create({
      email: user.email!,
      displayName,
      photoURL: user.photoURL || '',
      role,
      walletBalance: 0,
      referredBy,
      preferences: {}
    }, user.uid);
`;

const newRegister = `
    // Créer le document utilisateur dans Firestore
    await UsersService.create({
      email: user.email!,
      displayName,
      photoURL: user.photoURL || '',
      role,
      walletBalance: 0,
      referredBy,
      preferences: {}
    }, user.uid);
    
    // Créer automatiquement le document ambassadeur
    try {
      const code = 'AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await setDoc(doc(db, 'ambassadors', user.uid), {
        uid: user.uid,
        referralCode: code,
        referralLink: \`\${window.location.origin}/register?ref=\${code}\`,
        activatedAt: serverTimestamp(),
        activatedBy: user.uid,
        status: 'active',
        totalReferrals: 0,
        totalSales: 0,
        totalCommission: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Failed to init ambassador doc', e);
    }
`;

if (code.includes(originalRegister)) {
  code = code.replace(originalRegister, newRegister);
  fs.writeFileSync('src/services/authService.ts', code);
  console.log("Patched authService.ts");
} else {
  console.log("Could not find original code to replace");
}
