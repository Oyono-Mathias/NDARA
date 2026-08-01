const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  "role: 'student',",
  "role: user.email === 'oyonomathias@gmail.com' ? 'admin' : 'student',"
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
