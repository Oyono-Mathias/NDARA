const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleWorkspaceAuth.tsx', 'utf8');
content = content.replace('../components/ui/use-toast', '../hooks/use-toast');
fs.writeFileSync('src/components/GoogleWorkspaceAuth.tsx', content);
