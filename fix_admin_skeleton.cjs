const fs = require('fs');
const path = require('path');

const f = path.join(__dirname, 'src', 'views', 'admin', 'AdminMemberProfileView.tsx');
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/<NdaraSkeleton className/g, '<div className');
c = c.replace(/<\/NdaraSkeleton>/g, '</div>');

fs.writeFileSync(f, c);

