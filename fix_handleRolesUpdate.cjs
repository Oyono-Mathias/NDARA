const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf8');

code = code.replace(
  /const handleRolesUpdate = async \(role: string, action: 'add' \| 'remove'\) => \{[\s\S]*?\}\s*catch\(e: unknown\) \{[\s\S]*?\}\s*\};\s*/g,
  ""
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', code);
