const fs = require('fs');
let code1 = fs.readFileSync('src/views/admin/AdminAmbassadorHistory.tsx', 'utf8');
code1 = code1.replace(/\\\$/g, '$');
fs.writeFileSync('src/views/admin/AdminAmbassadorHistory.tsx', code1);

let code2 = fs.readFileSync('src/views/admin/AdminAmbassadorLeaderboard.tsx', 'utf8');
code2 = code2.replace(/\\\$/g, '$');
fs.writeFileSync('src/views/admin/AdminAmbassadorLeaderboard.tsx', code2);
