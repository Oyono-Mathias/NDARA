const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorDashboard.tsx', 'utf8');

code = code.replace(
  /orderBy\("date", "desc"\),\n\s*limit\(200\),/g,
  '/* orderBy("date", "desc") removed to avoid missing index error */'
);

fs.writeFileSync('src/views/instructor/InstructorDashboard.tsx', code);
