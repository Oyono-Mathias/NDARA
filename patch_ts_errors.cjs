const fs = require('fs');

const withdrawFile = 'src/views/admin/AdminWithdrawals.tsx';
let wCode = fs.readFileSync(withdrawFile, 'utf8');
wCode = wCode.replace(
  'const uids = [...new Set(docs.map(d => d.ambassadorUid))];',
  'const uids = [...new Set(docs.map(d => (d as any).ambassadorUid))];'
);
wCode = wCode.replace(
  'setRequests(docs.map(d => ({ ...d, user: usersData[d.ambassadorUid] || {} })));',
  'setRequests(docs.map(d => ({ ...d, user: usersData[(d as any).ambassadorUid] || {} })));'
);
fs.writeFileSync(withdrawFile, wCode);

const walletFile = 'src/views/ambassador/AmbassadorWallet.tsx';
let waCode = fs.readFileSync(walletFile, 'utf8');
waCode = waCode.replace(
  'onChange={(e) => setWithdrawAmount(e.target.value)}',
  'onChange={(e) => setWithdrawAmount(Number(e.target.value))}'
);
fs.writeFileSync(walletFile, waCode);
