const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleWorkspaceAuth.tsx', 'utf8');
content = content.replace("scope: 'https://www.googleapis.com/auth/chat.spaces https://www.googleapis.com/auth/chat.messages https://www.googleapis.com/auth/drive.readonly',", "scope: 'https://www.googleapis.com/auth/chat.spaces https://www.googleapis.com/auth/chat.messages https://www.googleapis.com/auth/chat.memberships https://www.googleapis.com/auth/drive.readonly',");
fs.writeFileSync('src/components/GoogleWorkspaceAuth.tsx', content);
