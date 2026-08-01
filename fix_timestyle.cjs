const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

content = content.replace(/toLocaleDateString\('fr-FR', \{ dateStyle: 'long', timeStyle: 'short' \}\)/g, "toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })");

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
