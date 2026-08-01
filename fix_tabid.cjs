const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

content = content.replace(
  /type TabId = [^;]+;/,
  "type TabId = 'info' | 'formations' | 'quizzes' | 'certificats' | 'wallet' | 'license' | 'market' | 'p2p' | 'permissions' | 'stats' | 'activity' | 'roles' | 'security' | 'admin' | 'logs';"
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
