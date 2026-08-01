const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "{isInstructorMode ? 'EXPERT NDARA' : 'ÉTUDIANT NDARA'}",
  "{isAmbassadorMode ? 'AMBASSADEUR' : isInstructorMode ? 'EXPERT NDARA' : 'ÉTUDIANT NDARA'}"
);

fs.writeFileSync(file, code);
