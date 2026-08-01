const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  "      if (user.email === 'oyonomathias@gmail.com' && userDoc) {\n        userDoc.role = 'admin';\n        if (userDoc.role !== 'admin') {\n        try {\n          await UsersService.update(user.uid, { role: 'admin' });\n          userDoc.role = 'admin';\n        } catch (updateErr) {\n          console.error(\"Could not self-upgrade to admin\", updateErr);\n        }\n      }",
  "      if (user.email === 'oyonomathias@gmail.com' && userDoc) {\n        if (userDoc.role !== 'admin') {\n          try {\n            await UsersService.update(user.uid, { role: 'admin' });\n          } catch (updateErr) {\n            console.error(\"Could not self-upgrade to admin\", updateErr);\n          }\n        }\n        userDoc.role = 'admin';\n      }"
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
