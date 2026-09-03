const fs = require('fs');
let code = fs.readFileSync('src/context/RoleContext.tsx', 'utf8');

code = code.replace(
  'const userData = await userService.getById(currentUser.uid);',
  `// MOCK OVERRIDE
        const mockRole = localStorage.getItem('mock_auth_role');
        if (mockRole) {
          if (isMounted) {
            setRole(mockRole as UserRole);
            setLoading(false);
          }
          return;
        }
        const userData = await userService.getById(currentUser.uid);`
);

fs.writeFileSync('src/context/RoleContext.tsx', code);
