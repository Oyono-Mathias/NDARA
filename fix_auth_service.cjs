const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'services', 'authService.ts');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /let referredBy = undefined;\n\s*try \{[\s\S]*?\} catch\(e\) \{\}/,
  'let referredBy = undefined;'
);

fs.writeFileSync(file, code);
