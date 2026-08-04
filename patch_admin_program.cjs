const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorProgram.tsx', 'utf8');
code = code.replace(/'ambassador_levels'/g, "'affiliate_levels'");
code = code.replace(/'ambassador_badges'/g, "'affiliate_badges'");
code = code.replace(/'ambassador_challenges'/g, "'affiliate_challenges'");
fs.writeFileSync('src/views/admin/AdminAmbassadorProgram.tsx', code);
