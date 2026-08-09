const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorMarketing.tsx', 'utf8');

code = code.replace(
    /const \[courses, setCourses\] = useState<any\[\]>\(\[\]\);/,
    `const [courses, setCourses] = useState<any[]>([]);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);`
);

code = code.replace(
    /getDocs\(query\(collection\(db, 'courses'\), where\('isPublished', '==', true\)\)\),/,
    `getDocs(query(collection(db, 'courses'), where('isPublished', '==', true))),
        getDocs(query(collection(db, 'market_items'), where('status', '==', 'approved'))),`
);

code = code.replace(
    /setCourses\(cSnap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\);/,
    `setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const marketDocs = arguments[0][2]?.docs || []; // Because we added a query in Promise.all
      // Assuming aSnap is 0, cSnap is 1, market is 2, campSnap is 3 if we add it exactly there. Wait. let's rewrite the Promise.all properly.`
);
