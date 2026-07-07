const fs = require('fs');

let ad = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');
ad = ad.replace(/export function AdminTransactions\(\) \{/g, 'export function AdminTransactions() {\n  const [processing, setProcessing] = useState(false);\n');
fs.writeFileSync('src/views/admin/AdminTransactions.tsx', ad);
