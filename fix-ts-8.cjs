const fs = require('fs');

let p = fs.readFileSync('src/lib/paymentProviders.ts', 'utf8');
p = p.replace(/2025-02-24\.acacia/g, '2026-06-24.dahlia');
fs.writeFileSync('src/lib/paymentProviders.ts', p);

let tm = fs.readFileSync('src/views/TemplateMarket.tsx', 'utf8');
tm = tm.replace(/\(\(\) => \{\}\)\(\/\* template\.id \*\/\)/g, '(() => {})()');
fs.writeFileSync('src/views/TemplateMarket.tsx', tm);

let ad = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');
ad = ad.replace(/const \[(.+?)\] = null as any;/g, '');
ad = ad.replace(/null as any/g, 'undefined'); // Actually the line was just deleted, maybe there is `const [processing, // setProcessing(`
fs.writeFileSync('src/views/admin/AdminTransactions.tsx', ad);
