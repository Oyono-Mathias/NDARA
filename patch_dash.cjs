const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorDashboard.tsx', 'utf8');
code = code.replace("totalComm += (d.amount || 0);", "totalComm += (d.commission || 0);");
fs.writeFileSync('src/views/admin/AdminAmbassadorDashboard.tsx', code);
