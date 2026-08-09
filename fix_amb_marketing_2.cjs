const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorMarketing.tsx', 'utf8');

code = code.replace(
    /const \[aSnap, cSnap, campSnap\] = await Promise\.all\(\[[\s\S]*?\]\);/,
    `const [aSnap, cSnap, marketSnap, certSnap, campSnap] = await Promise.all([
        getDocs(query(collection(db, 'marketing_assets'), where('isActive', '==', true))),
        getDocs(query(collection(db, 'courses'), where('isPublished', '==', true))),
        getDocs(query(collection(db, 'market_items'), where('status', '==', 'approved'))),
        getDocs(query(collection(db, 'certifications'))),
        getDocs(query(collection(db, 'ambassador_campaigns'), where('ambassadorId', '==', firebaseUser!.uid), orderBy('createdAt', 'desc')))
      ]);`
);

code = code.replace(
    /setCourses\(cSnap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\);/,
    `setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setEbooks(marketSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.type === 'ebook'));
      setCertifications(certSnap.docs.map(d => ({ id: d.id, ...d.data() })));`
);

fs.writeFileSync('src/views/ambassador/AmbassadorMarketing.tsx', code);
