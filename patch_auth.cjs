const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  'const unsubscribe = AuthService.onAuthStateChanged((user) => {',
  `// MOCK DEV AUTHENTICATION FOR PREVIEW
    const mockRole = localStorage.getItem('mock_auth_role');
    if (mockRole) {
      setCurrentUser({ uid: 'mock-user-123', email: 'dev@ndara.test' } as any);
      setLoading(false);
      return () => {};
    }

    const unsubscribe = AuthService.onAuthStateChanged((user) => {`
);

code = code.replace(
  'await AuthService.signOutUser();',
  `localStorage.removeItem('mock_auth_role');
    try { await AuthService.signOutUser(); } catch (e) {}
    setCurrentUser(null);`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
