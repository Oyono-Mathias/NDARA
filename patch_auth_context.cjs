const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const target1 = `  const fetchAppUser = async (uid: string) => {`;
const rep1 = `  const fetchAppUser = async (user: FirebaseUser) => {
    try {
      let userDoc = await UsersService.getById(user.uid);
      if (!userDoc) {
          // Auto-create missing profile
          await UsersService.create({
              email: user.email || '',
              displayName: user.displayName || 'Utilisateur',
              photoURL: user.photoURL || '',
              role: 'student',
              walletBalance: 0,
              preferences: {}
          }, user.uid);
          userDoc = await UsersService.getById(user.uid);
      }
      setAppUser(userDoc);
    } catch (error) {
      logger.error("Erreur lors de la récupération du profil utilisateur", error);
      setAppUser(null);
    }
  };`;

content = content.replace(target1 + `\n    try {\n      const userDoc = await UsersService.getById(uid);\n      setAppUser(userDoc);\n    } catch (error) {\n      logger.error("Erreur lors de la récupération du profil utilisateur", error);\n      setAppUser(null);\n    }\n  };`, rep1);

content = content.replace('await fetchAppUser(firebaseUser.uid);', 'await fetchAppUser(firebaseUser);');
content = content.replace('await fetchAppUser(user.uid);', 'await fetchAppUser(user);');

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
console.log("Patched AuthContext");
