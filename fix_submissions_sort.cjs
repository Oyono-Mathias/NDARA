const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorDashboard.tsx', 'utf8');

code = code.replace(
  /orderBy\("submittedAt", "desc"\),\n\s*limit\(5\),/g,
  '/* orderBy and limit removed for missing index */'
);

code = code.replace(
  /snap\.docs\.map\(\(d\) => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\),/g,
  'snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a,b) => ((b.submittedAt?.toMillis?.() || 0) - (a.submittedAt?.toMillis?.() || 0))).slice(0, 5),'
);

fs.writeFileSync('src/views/instructor/InstructorDashboard.tsx', code);
