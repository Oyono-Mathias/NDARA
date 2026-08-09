const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorBadges.tsx', 'utf8');

code = code.replace(
    /Programme Ambassadeur/g,
    "Badges & Niveaux"
);

code = code.replace(
    /Gérez les niveaux, les badges, les défis et les commissions d'affiliation./,
    "Gérez les niveaux, les badges et les défis du programme d'affiliation."
);

fs.writeFileSync('src/views/admin/AdminAmbassadorBadges.tsx', code);
