const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import { GoogleOAuthProvider } from '@react-oauth/google';\n", "");
code = code.replace(
  '        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "587671830023-b9jr9fkuglfivhaeq5a2rnagi4cn3gf6.apps.googleusercontent.com"}>\n',
  ''
);
code = code.replace('      </GoogleOAuthProvider>\n', '');

fs.writeFileSync('src/App.tsx', code);
