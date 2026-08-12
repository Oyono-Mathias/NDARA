const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const target = `  const fetchAppUser = async (user: FirebaseUser) => {
    try {
      let userDoc = await UsersService.getById(user.uid);
      if (!userDoc) {
          // Auto-create missing profile
          await UsersService.create({
              email: user.email || '',
              displayName: user.displayName || 'Utilisateur',
              photoURL: user.photoURL || '',
              role: user.email === 'oyonomathias@gmail.com' ? 'admin' : 'student',
              walletBalance: 0,
              preferences: {}
          }, user.uid);
          userDoc = await UsersService.getById(user.uid);
      }

      // Automatically make the user an admin if they have the specific email
      if (user.email === 'oyonomathias@gmail.com' && userDoc) {
        if (userDoc.role !== 'admin') {
          try {
            await UsersService.update(user.uid, { role: 'admin' });
          } catch (updateErr) {
            console.error("Could not self-upgrade to admin", updateErr);
          }
        }
        userDoc.role = 'admin';
      }

      setAppUser(userDoc);
      
      // Track login & auto-create ambassador
      try {
        const token = await user.getIdToken();
        
        const refCode = localStorage.getItem('referredBy');
        await fetch('/api/user/track', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refCode })
        });
      } catch (err) {
        console.error("Failed to track login", err);
      }
    } catch (error: any) {`;

const repl = `  const fetchAppUser = async (user: FirebaseUser) => {
    try {
      try {
        const token = await user.getIdToken();
        const refCode = localStorage.getItem('referredBy');
        await fetch('/api/user/track', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refCode })
        });
      } catch (err) {
        console.error("Failed to track login", err);
      }

      let userDoc = await UsersService.getById(user.uid);
      if (userDoc) {
        setAppUser(userDoc);
      } else {
        setAppUser({
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Utilisateur',
            photoURL: user.photoURL || '',
            role: 'student',
            walletBalance: 0,
            preferences: {}
        } as any);
      }
    } catch (error: any) {`;

if (content.includes(target)) {
  content = content.replace(target, repl);
  fs.writeFileSync('src/contexts/AuthContext.tsx', content);
  console.log("Patched successfully!");
} else {
  console.log("Could not find target content.");
}
