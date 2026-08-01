const fs = require('fs');
let content = fs.readFileSync('src/views/StudentSquads.tsx', 'utf8');
content = content.replace('  createdAt: any;\n}', '  createdAt: any;\n  chatSpaceName?: string;\n}');
fs.writeFileSync('src/views/StudentSquads.tsx', content);
