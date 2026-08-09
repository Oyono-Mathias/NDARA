const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorLeaderboard.tsx', 'utf8');

code = code.replace(
    /\\`Top \\\$\{f\}\\`/g,
    "`Top ${f}`"
);

fs.writeFileSync('src/views/admin/AdminAmbassadorLeaderboard.tsx', code);
