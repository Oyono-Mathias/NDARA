const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorLayout.tsx', 'utf8');

const importReplacement = `import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';`;

code = code.replace(/import React, \{ useState \} from 'react';\nimport \{ Routes, Route, Navigate, useLocation \} from 'react-router-dom';/, importReplacement);

const newLogic = `  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function checkAndInitAmbassador() {
      if (!firebaseUser) return;
      try {
        const ambRef = doc(db, 'ambassadors', firebaseUser.uid);
        const ambSnap = await getDoc(ambRef);
        
        if (!ambSnap.exists()) {
          const code = 'AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
          await setDoc(ambRef, {
            uid: firebaseUser.uid,
            referralCode: code,
            referralLink: \`\${window.location.origin}/register?ref=\${code}\`,
            activatedAt: serverTimestamp(),
            activatedBy: firebaseUser.uid,
            status: 'active',
            totalReferrals: 0,
            totalSales: 0,
            totalCommission: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (err) {
        console.error('Failed to init ambassador doc', err);
      } finally {
        setIsInitializing(false);
      }
    }
    checkAndInitAmbassador();
  }, [firebaseUser]);

  if (authLoading || roleLoading || isInitializing) {
    return (
      <div className="flex h-screen bg-[#0B0F19] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!firebaseUser || !currentUser) {
    return <Navigate to="/" replace />;
  }`;

code = code.replace(
/  if \(authLoading \|\| roleLoading\) \{[\s\S]*?if \(!firebaseUser \|\| !currentUser\) \{[\s\S]*?replace \/>;\n  \}\n\n  const isAmbassador = currentUser.role === 'ambassador' \|\| \['admin', 'superadmin'\].includes\(currentUser.role\);\n\n  if \(!isAmbassador\) \{[\s\S]*?\}\n/,
newLogic + "\n"
);

fs.writeFileSync('src/views/ambassador/AmbassadorLayout.tsx', code);
