const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

content = content.replace(
  /<ActionButton icon=\{User\} label="Impersonation" onClick=\{async \(\) => \{[^}]+\}[^}]+\}[^}]+\}[^>]+\/>/g,
  ""
);
content = content.replace(
  /<ActionButton icon=\{User\} label="Impersonation"[\s\S]*?toast\(\{ title: "Connecté" \}\);\s*\}\s*\}\} \/>/g,
  ""
);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
