const fs = require('fs');

// 1. Fix Sidebar.tsx
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace('import { ShieldCheck, ', 'import { '); // revert the bad import
sidebar = sidebar.replace(
  `import { ArrowLeftRight, `,
  `import { ShieldCheck, ArrowLeftRight, `
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

// 2. Fix AmbassadorKyc.tsx
let kyc = fs.readFileSync('src/views/ambassador/AmbassadorKyc.tsx', 'utf8');
if (!kyc.includes('ShieldCheck')) {
  kyc = kyc.replace(
    `import { AlertCircle, `,
    `import { AlertCircle, ShieldCheck, `
  );
} else if (!kyc.includes('import { AlertCircle, ShieldCheck')) {
  kyc = kyc.replace('AlertCircle, Clock', 'AlertCircle, Clock, ShieldCheck');
}
fs.writeFileSync('src/views/ambassador/AmbassadorKyc.tsx', kyc);

// 3. Fix AmbassadorWallet.tsx
let wallet = fs.readFileSync('src/views/ambassador/AmbassadorWallet.tsx', 'utf8');
if (!wallet.includes('ShieldCheck')) {
  wallet = wallet.replace(
    `import { Wallet,`,
    `import { Wallet, ShieldCheck,`
  );
}
if (!wallet.includes('import { Link } from')) {
  wallet = `import { Link } from 'react-router-dom';\n` + wallet;
}
fs.writeFileSync('src/views/ambassador/AmbassadorWallet.tsx', wallet);
