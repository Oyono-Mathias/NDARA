const fs = require('fs');

let tm = fs.readFileSync('src/views/TemplateMarket.tsx', 'utf8');
tm = tm.replace(/\(\(\) => \{\}\)\(\/\* template\.id \*\/\);/g, '(() => {})();');
fs.writeFileSync('src/views/TemplateMarket.tsx', tm);

let ad = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');
ad = ad.replace(/const \[([a-zA-Z]+), ([a-zA-Z]+)\] = \(\{\} as any\);/g, 'const [$1, $2] = [null, null] as any;');
ad = ad.replace(/(\{\} as any)/g, 'null as any');
fs.writeFileSync('src/views/admin/AdminTransactions.tsx', ad);

let p = fs.readFileSync('src/lib/paymentProviders.ts', 'utf8');
p = p.replace(/"2025-02-24\.acacia"/g, '("2026-06-24.dahlia" as any)');
fs.writeFileSync('src/lib/paymentProviders.ts', p);
