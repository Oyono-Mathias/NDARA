import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regexReg = /const authUser = await admin\.auth\(\)\.getUser\(uid\);([\s\S]*?)email: authUser\.email \|\| '',\s*displayName: authUser\.displayName \|\| 'Utilisateur',\s*photoURL: authUser\.photoURL \|\| '',/g;

content = content.replace(regexReg, `// Removed getUser due to IAM restrictions in AI Studio. The token contains the data.
        const authUser = req.user;
        await userRef.set({
          uid,
          email: authUser.email || '',
          displayName: authUser.name || 'Utilisateur',
          photoURL: authUser.picture || '',`);

fs.writeFileSync('server.ts', content);
console.log("Fixed server.ts authUser!");
