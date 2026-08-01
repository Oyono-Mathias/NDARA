const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('path="/ambassador/*"')) {
    code = code.replace(
        '{/* === ADMIN ROUTES === */}',
        '<Route path="/ambassador/*" element={<AmbassadorLayout />} />\n\n        {/* === ADMIN ROUTES === */}'
    );
    fs.writeFileSync(file, code);
}
