const fs = require('fs');
let auth = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

auth = auth.replace(
  'setAppUser(userDoc);',
  `// Automatically make the user an admin if they have the specific email
      if (user.email === 'oyonomathias@gmail.com' && userDoc && userDoc.role !== 'admin') {
        try {
          await UsersService.update(user.uid, { role: 'admin' });
          userDoc.role = 'admin';
        } catch (updateErr) {
          console.error("Could not self-upgrade to admin", updateErr);
        }
      }
      setAppUser(userDoc);`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', auth);
console.log("Patched AuthContext.tsx");
