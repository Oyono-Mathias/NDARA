const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorDashboard.tsx', 'utf8');
code = "import { MigrationButton } from './MigrationButton';\n" + code;
code = code.replace(/<AdminAmbassadorsList \/>/g, '<MigrationButton />\n        <AdminAmbassadorsList />');
fs.writeFileSync('src/views/admin/AdminAmbassadorDashboard.tsx', code);
