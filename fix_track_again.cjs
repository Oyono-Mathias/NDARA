const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `
        if (referredBy) {
          const referrerRef = adminDb.collection('ambassadors').doc(referredBy);
          const referrerDoc = await referrerRef.get();
          if (referrerDoc.exists) {
            await referrerRef.update({
              totalRegistrations: FieldValue.increment(1)
            });
          }
        }`;

const replacement = `
        if (referredBy) {
          // referredBy might be the referralCode or the UID.
          let referrerDoc;
          let referrerRef;
          
          if (referredBy.startsWith('AMB-')) {
             const qs = await adminDb.collection('ambassadors').where('referralCode', '==', referredBy).limit(1).get();
             if (!qs.empty) {
               referrerDoc = qs.docs[0];
               referrerRef = referrerDoc.ref;
             }
          } else {
             referrerRef = adminDb.collection('ambassadors').doc(referredBy);
             referrerDoc = await referrerRef.get();
          }
          
          if (referrerDoc && referrerDoc.exists) {
            const actualReferrerUid = referrerDoc.id;
            await referrerRef.update({
              totalRegistrations: FieldValue.increment(1)
            });
            
            // Register the affiliate registration event
            await adminDb.collection('affiliate_registrations').add({
              ambassadorId: actualReferrerUid,
              referredUserId: uid,
              referralCode: referrerDoc.data().referralCode || referredBy,
              createdAt: now
            });
            
            // Also update the user document to reflect the actual referredBy uid
            await userRef.update({ referredBy: actualReferrerUid, referralCode: referrerDoc.data().referralCode || referredBy });
            referredBy = actualReferrerUid;
          } else {
            referredBy = null;
          }
        }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
