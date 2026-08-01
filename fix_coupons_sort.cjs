const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCoupons.tsx', 'utf8');

code = code.replace(
  /orderBy\("createdAt", "desc"\),/g,
  '/* orderBy removed */'
);

code = code.replace(
  /snap\.docs\.map\(\(doc\) => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\)/g,
  'snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a,b) => ((b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)))'
);

fs.writeFileSync('src/views/instructor/InstructorCoupons.tsx', code);
