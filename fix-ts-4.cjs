const fs = require('fs');

let p = fs.readFileSync('src/lib/paymentProviders.ts', 'utf8');
p = p.replace(/"2020-08-27"/g, '"2026-06-24.dahlia" as any');
fs.writeFileSync('src/lib/paymentProviders.ts', p);

let tm = fs.readFileSync('src/views/TemplateMarket.tsx', 'utf8');
tm = tm.replace(/\(\(\) => \{\}\)\(template.id\)/g, '(() => {})()');
fs.writeFileSync('src/views/TemplateMarket.tsx', tm);

let ad = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');
ad = ad.replace(/undefined\.uid/g, '""');
fs.writeFileSync('src/views/admin/AdminTransactions.tsx', ad);
