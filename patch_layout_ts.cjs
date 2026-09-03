const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');
code = code.replace("import { useRole } from '../context/RoleContext';\n", "");
fs.writeFileSync('src/layouts/MainLayout.tsx', code);
