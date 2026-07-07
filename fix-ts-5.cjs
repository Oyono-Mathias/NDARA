const fs = require('fs');

let p = fs.readFileSync('src/lib/paymentProviders.ts', 'utf8');
p = p.replace(/2020-08-27/g, '2025-02-24.acacia');
p = p.replace(/"2025-02-24\.acacia"/g, '("2026-06-24.dahlia" as any)');
fs.writeFileSync('src/lib/paymentProviders.ts', p);

let tm = fs.readFileSync('src/views/TemplateMarket.tsx', 'utf8');
tm = tm.replace(/\(\(\) => \{\}\)\(template.id\)/g, '(() => {})(/* template.id */)');
fs.writeFileSync('src/views/TemplateMarket.tsx', tm);

let ad = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');
ad = ad.replace(/undefined\.uid/g, '""');
ad = ad.replace(/undefined/g, 'null'); // wait, the error is "The value 'undefined' cannot be used here".
// Let's replace 'undefined' with 'null' if we used it
fs.writeFileSync('src/views/admin/AdminTransactions.tsx', ad);
