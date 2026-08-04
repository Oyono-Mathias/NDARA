const fs = require('fs');

let authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

if (!authContext.includes("import { onSnapshot, doc } from 'firebase/firestore';")) {
  authContext = authContext.replace("import { User as AppUser }", "import { User as AppUser } from '../types/models';\nimport { onSnapshot, doc } from 'firebase/firestore';\nimport { db } from '../firebase';");
  
  authContext = authContext.replace(
    /useEffect\(\(\) => \{\n\s*const unsubscribeAuth = authService.onAuthStateChanged\(async \(user\) => \{([\s\S]*?)return \(\) => unsubscribeAuth\(\);\n\s*\}, \[\]\);/g,
    `useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;
    const unsubscribeAuth = authService.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchAppUser(user);
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
             const data = docSnap.data();
             if (user.email === 'oyonomathias@gmail.com') {
                 data.role = 'admin';
             }
             setAppUser(data as any);
          }
        });
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);`
  );
  
  fs.writeFileSync('src/contexts/AuthContext.tsx', authContext);
}
