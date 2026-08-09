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
        console.error("Failed to track login", err);
      }`;

const replacement = `      // Track login & auto-create ambassador locally
      try {
        const { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, query, where, getDocs, updateDoc, increment } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const { AmbassadorsService, UsersService } = await import('../services/db');
        
        let ambDoc = await AmbassadorsService.getById(user.uid);
        if (!ambDoc) {
          const referralCode = 'AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
          let referredBy = userDoc?.referredBy || null;
          
          await AmbassadorsService.create({
            uid: user.uid,
            referralCode,
            referralLink: \`https://ndara.afrique/register?ref=\${referralCode}\`,
            email: user.email || '',
            name: user.displayName || 'Utilisateur',
            country: 'Non renseigné',
            totalClicks: 0,
            totalRegistrations: 0,
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
            level: 'bronze',
            badge: 'Débutant',
            status: 'active',
            referredBy,
            createdAt: serverTimestamp() as any,
            lastLoginAt: serverTimestamp() as any
          } as any, user.uid);
          
          if (referredBy) {
            let referrerUid = null;
            if (referredBy.startsWith('AMB-')) {
               const qs = await getDocs(query(collection(db, 'ambassadors'), where('referralCode', '==', referredBy)));
               if (!qs.empty) {
                 referrerUid = qs.docs[0].id;
               }
            } else {
               referrerUid = referredBy;
            }
            if (referrerUid) {
               await updateDoc(doc(db, 'ambassadors', referrerUid), { totalRegistrations: increment(1) });
               await addDoc(collection(db, 'affiliate_registrations'), {
                  ambassadorId: referrerUid,
                  referredUserId: user.uid,
                  referralCode: referredBy,
                  createdAt: serverTimestamp()
               });
               await UsersService.update(user.uid, { referredBy: referrerUid });
            }
          }
        } else {
          await AmbassadorsService.update(user.uid, {
            lastLoginAt: serverTimestamp() as any,
            email: user.email || '',
            name: user.displayName || 'Utilisateur'
          } as any);
        }
        
        await addDoc(collection(db, 'login_history'), {
          uid: user.uid,
          email: user.email || '',
          loginAt: serverTimestamp(),
          ip: "ClientSide",
          userAgent: navigator.userAgent
        });
      } catch (err) {
        console.error("Failed to track login locally", err);
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/contexts/AuthContext.tsx', code);
