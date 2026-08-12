import fs from 'fs';

let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const regex = /const fetchAppUser = async \(user: FirebaseUser\) => \{([\s\S]*?)\} catch \(error: any\) \{/;
const replacement = `const fetchAppUser = async (user: FirebaseUser) => {
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

content = content.replace(regex, replacement);
fs.writeFileSync('src/contexts/AuthContext.tsx', content);
console.log("Patched!");
