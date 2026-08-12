import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc, addDoc, serverTimestamp, increment, query, where, limit, getDocs } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

export const trackLogin = async (user: FirebaseUser) => {
  try {
    const uid = user.uid;
    const email = user.email;
    const now = serverTimestamp();
    
    // Auto-create Ambassador profile
    const ambRef = doc(db, 'ambassadors', uid);
    const ambDoc = await getDoc(ambRef);
    
    if (!ambDoc.exists()) {
      let referredBy = null;
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data().referredBy) {
        referredBy = userDoc.data().referredBy;
      }
      
      const referralCode = 'AMB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await setDoc(ambRef, {
        uid: uid,
        referralCode: referralCode,
        referralLink: `https://ndara.afrique/register?ref=${referralCode}`,
        email: email || '',
        name: user.displayName || (userDoc.exists() ? userDoc.data().displayName : 'Utilisateur'),
        country: 'Non renseigné',
        totalClicks: 0,
        totalRegistrations: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        level: 'bronze',
        badge: 'Débutant',
        status: 'active',
        referredBy: referredBy,
        createdAt: now,
        lastLoginAt: now
      });
      
      if (referredBy) {
        let referrerDoc;
        let referrerRef;
        
        if (referredBy.startsWith('AMB-')) {
           const qs = query(collection(db, 'ambassadors'), where('referralCode', '==', referredBy), limit(1));
           const snapshot = await getDocs(qs);
           if (!snapshot.empty) {
             referrerDoc = snapshot.docs[0];
             referrerRef = referrerDoc.ref;
           }
        } else {
           referrerRef = doc(db, 'ambassadors', referredBy);
           referrerDoc = await getDoc(referrerRef);
        }
        
        if (referrerDoc && referrerDoc.exists()) {
          const actualReferrerUid = referrerDoc.id;
          await updateDoc(referrerRef, {
            totalRegistrations: increment(1)
          });
          
          await addDoc(collection(db, 'affiliate_registrations'), {
            ambassadorId: actualReferrerUid,
            referredUserId: uid,
            referralCode: referrerDoc.data().referralCode || referredBy,
            createdAt: now
          });
          
          await updateDoc(userRef, { referredBy: actualReferrerUid, referralCode: referrerDoc.data().referralCode || referredBy });
        }
      }
    } else {
      await updateDoc(ambRef, {
        lastLoginAt: now,
        email: email || '',
        name: user.displayName || 'Utilisateur'
      });
    }
    
    await addDoc(collection(db, 'login_history'), {
      uid,
      email,
      loginAt: now,
      userAgent: navigator.userAgent
    });
  } catch (err) {
    console.warn("Failed to track login offline", err);
  }
};
