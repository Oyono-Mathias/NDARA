const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  'clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}',
  'clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy_client_id"}'
);
fs.writeFileSync('src/App.tsx', code);
