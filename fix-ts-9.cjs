const fs = require('fs');
let ad = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');

ad = ad.replace(/await \(undefined\)\?.getIdToken\(\)/g, '"dummy"');
// there might be others
ad = ad.replace(/await undefined\?.getIdToken\(\)/g, '"dummy"');
fs.writeFileSync('src/views/admin/AdminTransactions.tsx', ad);
