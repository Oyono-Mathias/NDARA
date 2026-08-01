const fs = require('fs');
let content = fs.readFileSync('src/contexts/GoogleProvider.tsx', 'utf8');

content = content.replace(
  "import { GoogleOAuthProvider } from '@react-oauth/google';",
  "import { GoogleOAuthProvider } from '@react-oauth/google';\nimport firebaseConfig from '../../firebase-applet-config.json';"
);

content = content.replace(
  "const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';",
  "const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || firebaseConfig.oAuthClientId || '1234567890-mockclientid.apps.googleusercontent.com';"
);

fs.writeFileSync('src/contexts/GoogleProvider.tsx', content);
console.log("Patched GoogleProvider.tsx");
