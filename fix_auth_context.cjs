const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const target = `      // Track login & auto-create ambassador
      try {
        const token = await user.getIdToken();
        await fetch('/api/user/track', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`
          }
        });
      } catch (err) {
        console.error('Error tracking login:', err);
      }`;

const replacement = `      // Track login & auto-create ambassador locally
      try {
        const { getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc, query, where, getDocs, increment } = await import('firebase/firestore');
        const now = serverTimestamp();
        let ip = "Non disponible";
        try {
          const res = await fetch('https://api.ipify.org?format=json');
          const data = await res.json();
          ip = data.ip;
        } catch(e) {}
        
        const userAgent = navigator.userAgent;
        
        const userRef = doc(db, 'users', user.uid);
        const ambRef = doc(db, 'ambassadors', user.uid);
        const ambSnap = await getDoc(ambRef);
        
        let referralCode = userDoc?.referralCode || (ambSnap.exists() ? ambSnap.data().referralCode : ('AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase()));
        
        if (!ambSnap.exists()) {
          let referredBy = userDoc?.referredBy || null;
          
          await setDoc(ambRef, {
            uid: user.uid,
            referralCode,
            referralLink: \`https://ndara.afrique/register?ref=\${referralCode}\`,
            email: user.email || '',
            name: user.displayName || userDoc?.displayName || 'Utilisateur',
            country: 'Non renseigné',
            totalClicks: 0,
            totalRegistrations: 0,
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
            availableBalance: 0,
            pendingBalance: 0,
            withdrawnAmount: 0,
            level: 'bronze',
            status: 'active',
            referredBy,
            createdAt: userDoc?.createdAt || now,
            lastLoginAt: now
          });
          
          if (referredBy) {
            let referrerRef;
            let referrerDoc;
            let actualReferrerUid = null;
            if (referredBy.startsWith('AMB-')) {
               const qs = await getDocs(query(collection(db, 'ambassadors'), where('referralCode', '==', referredBy)));
               if (!qs.empty) {
                 referrerDoc = qs.docs[0];
                 referrerRef = referrerDoc.ref;
                 actualReferrerUid = referrerDoc.id;
               }
            } else {
               referrerRef = doc(db, 'ambassadors', referredBy);
               referrerDoc = await getDoc(referrerRef);
               if (referrerDoc.exists()) actualReferrerUid = referrerDoc.id;
            }
            
            if (actualReferrerUid) {
               await updateDoc(referrerRef, { totalRegistrations: increment(1) });
               await addDoc(collection(db, 'affiliate_registrations'), {
                  ambassadorId: actualReferrerUid,
                  referredUserId: user.uid,
                  referralCode: referrerDoc.data().referralCode || referredBy,
                  createdAt: now
               });
               await updateDoc(userRef, { referredBy: actualReferrerUid, referralCode });
            }
          }
        } else {
          await updateDoc(ambRef, { lastLoginAt: now, name: user.displayName || userDoc?.displayName || 'Utilisateur' });
        }
        
        await updateDoc(userRef, { lastLoginAt: now, lastLoginIp: ip, lastLoginUserAgent: userAgent });
        await addDoc(collection(db, 'login_history'), {
           uid: user.uid,
           email: user.email,
           loginAt: now,
           ip,
           userAgent
        });
      } catch (err) {
        console.error('Error tracking login locally:', err);
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/contexts/AuthContext.tsx', code);
