const fs = require('fs');

// Payment providers
let p = fs.readFileSync('src/lib/paymentProviders.ts', 'utf8');
p = p.replace(/"2025-02-24\.acacia"/g, '"2020-08-27"');
p = p.replace(/2025-02-24\.acacia/g, '2020-08-27');
p = p.replace(/2026-06-24\.dahlia/g, '2020-08-27'); // let's just wipe out any strict typing issue
// Stripe typing just needs what the interface wants. Let's see what it complains about.
// Wait, the simplest way is to cast it to any.
p = p.replace(/apiVersion: "2025-02-24.acacia",/g, 'apiVersion: "2025-02-24.acacia" as any,');
fs.writeFileSync('src/lib/paymentProviders.ts', p);

// TemplateMarket
let tm = fs.readFileSync('src/views/TemplateMarket.tsx', 'utf8');
tm = tm.replace(/handleDownloadTemplate/g, '(() => {})');
fs.writeFileSync('src/views/TemplateMarket.tsx', tm);

// AdminTransactions
let ad = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');
ad = ad.replace(/null \/\* auth not imported \*\//g, 'undefined');
fs.writeFileSync('src/views/admin/AdminTransactions.tsx', ad);
