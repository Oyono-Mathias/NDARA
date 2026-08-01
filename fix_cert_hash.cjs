const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const regex = /certificateNumber: Math\.random\(\)\.toString\(36\)\.substring\(7\)\.toUpperCase\(\),/;
const replacement = `certificateNumber: Math.random().toString(36).substring(7).toUpperCase(),
            hash: Math.random().toString(36).substring(7),`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
