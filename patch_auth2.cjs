const fs = require('fs');
let auth = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

auth = auth.replace(
  `role: 'student',`,
  `role: user.email === 'oyonomathias@gmail.com' ? 'admin' : 'student',`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', auth);
console.log("Patched AuthContext.tsx fallback");
