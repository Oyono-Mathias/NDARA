const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\} \/>\n          <Route path="marketing-assets"/, '\n          <Route path="marketing-assets"');

fs.writeFileSync('src/App.tsx', code);
