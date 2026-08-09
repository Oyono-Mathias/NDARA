const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorRewards.tsx', 'utf8');

code = code.replace(
    /if \(snap\.empty\) \{\n\s*setRewards\(\[\n[\s\S]*?\]\);\n\s*\} else \{/,
    "if (!snap.empty) {"
);

fs.writeFileSync('src/views/admin/AdminAmbassadorRewards.tsx', code);
