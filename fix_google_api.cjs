const fs = require('fs');
let code = fs.readFileSync('google-api.ts', 'utf8');

code = code.replace(
  "import { OAuth2Client } from 'google-auth-library';",
  ""
);

code = code.replace(
  "const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);",
  "const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);"
);

fs.writeFileSync('google-api.ts', code);
