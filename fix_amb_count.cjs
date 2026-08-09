const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorDashboard.tsx', 'utf8');

code = code.replace(
  "const unsubAmbassadors = onSnapshot(collection(db, 'users'), (snap) => {",
  "const unsubAmbassadors = onSnapshot(collection(db, 'ambassadors'), (snap) => {"
);

fs.writeFileSync('src/views/admin/AdminAmbassadorDashboard.tsx', code);
