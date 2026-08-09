const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const listImport = "const AdminAmbassadorsList = React.lazy(() => import('./views/admin/AdminAmbassadorsList').then(m => ({ default: m.AdminAmbassadorsList })));";
const profileImport = "const AdminAmbassadorProfile = React.lazy(() => import('./views/admin/AdminAmbassadorProfile').then(m => ({ default: m.AdminAmbassadorProfile })));";

code = code.replace("const AdminAmbassadorHistory", `${listImport}\n${profileImport}\nconst AdminAmbassadorHistory`);

const routes = `
          <Route path="ambassador/list" element={<AdminAmbassadorsList />} />
          <Route path="ambassador/profile/:uid" element={<AdminAmbassadorProfile />} />
          <Route path="ambassador/history" element={<AdminAmbassadorHistory />} />
`;

code = code.replace(/<Route path="ambassador\/history".*\/>/g, routes);

fs.writeFileSync('src/App.tsx', code);
