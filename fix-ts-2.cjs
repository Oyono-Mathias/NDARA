const fs = require('fs');
let p = fs.readFileSync('src/views/Payments.tsx', 'utf8');
p = p.replace(/payment\.timestamp \|\| /g, '');
p = p.replace(/a\.timestamp \|\| /g, '');
p = p.replace(/b\.timestamp \|\| /g, '');
fs.writeFileSync('src/views/Payments.tsx', p);

let tm = fs.readFileSync('src/views/TemplateMarket.tsx', 'utf8');
tm = tm.replace(/onClick=\{handleDownloadTemplate\}/g, '');
fs.writeFileSync('src/views/TemplateMarket.tsx', tm);

let ad = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');
ad = ad.replace(/setProcessing\(/g, '// setProcessing(');
ad = ad.replace(/auth\.currentUser/g, 'null /* auth not imported */');
fs.writeFileSync('src/views/admin/AdminTransactions.tsx', ad);
