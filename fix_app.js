const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/<GoogleOAuthProvider[^>]*>/g, '');
code = code.replace(/<\/GoogleOAuthProvider>/g, '');
code = code.replace(/import \{ GoogleOAuthProvider \} from '@react-oauth\/google';/g, '');
fs.writeFileSync('src/App.tsx', code);
