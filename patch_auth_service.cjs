const fs = require('fs');
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

code = code.replace(
  'let referredBy = undefined;',
  `let referredBy = localStorage.getItem('referredBy') || undefined;`
);

code = code.replace(
  'await updateProfile(user, { displayName });',
  `await updateProfile(user, { displayName });\n    const now = new Date();`
);

// We need to pass createdAt and lastLoginAt when creating a user. 
code = code.replace(
  'preferences: {}',
  `preferences: {},\n      createdAt: new Date(),\n      lastLoginAt: new Date()`
);

fs.writeFileSync('src/services/authService.ts', code);
