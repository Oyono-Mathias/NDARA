const fs = require('fs');
let code = fs.readFileSync('src/components/ReferralTracker.tsx', 'utf8');

const target = `      if (!hasTracked) {
        fetch('/api/ambassador/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refCode: ref,
            landingPage: window.location.pathname
          })
        }).catch(err => console.error('Error tracking click:', err));
        
        sessionStorage.setItem(\`tracked_\${ref}\`, 'true');
      }`;

const replacement = `      if (!hasTracked) {
        (async () => {
          try {
            const { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, increment } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            
            let ip = "Non disponible";
            try {
              const res = await fetch('https://api.ipify.org?format=json');
              const data = await res.json();
              ip = data.ip;
            } catch(e) {}
            
            const userAgent = navigator.userAgent;
            
            const qs = await getDocs(query(collection(db, 'ambassadors'), where('referralCode', '==', ref)));
            if (!qs.empty) {
              const ambDoc = qs.docs[0];
              await addDoc(collection(db, 'affiliate_clicks'), {
                ambassadorId: ambDoc.id,
                referralCode: ref,
                timestamp: serverTimestamp(),
                landingPage: window.location.pathname,
                userAgent,
                ip,
                converted: false
              });
              await updateDoc(ambDoc.ref, { totalClicks: increment(1) });
            }
          } catch (err) {
             console.error('Error tracking click locally:', err);
          }
        })();
        
        sessionStorage.setItem(\`tracked_\${ref}\`, 'true');
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/ReferralTracker.tsx', code);
