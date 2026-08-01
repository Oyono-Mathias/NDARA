const fs = require('fs');
let code = fs.readFileSync('src/guards/GuestGuard.tsx', 'utf8');

code = code.replace(
  "if (firebaseUser) {",
  "if (firebaseUser && appUser) {"
);

fs.writeFileSync('src/guards/GuestGuard.tsx', code);
