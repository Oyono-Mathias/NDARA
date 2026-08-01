const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const imports = `
const AdminWithdrawals = React.lazy(() => import('./views/admin/AdminWithdrawals').then(module => ({ default: module.AdminWithdrawals })));
const AdminAmbassadorProgram = React.lazy(() => import('./views/admin/AdminAmbassadorProgram').then(module => ({ default: module.AdminAmbassadorProgram })));
const AdminMarketingAssets = React.lazy(() => import('./views/admin/AdminMarketingAssets').then(module => ({ default: module.AdminMarketingAssets })));
`;

const routes = `
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="ambassador-program" element={<AdminAmbassadorProgram />} />
          <Route path="marketing-assets" element={<AdminMarketingAssets />} />
`;

if (!code.includes('AdminMarketingAssets')) {
    code = code.replace(
        "const AdminHelp = React.lazy(() => import('./views/admin/AdminHelp').then(module => ({ default: module.AdminHelp })));",
        "const AdminHelp = React.lazy(() => import('./views/admin/AdminHelp').then(module => ({ default: module.AdminHelp })));" + imports
    );
    
    code = code.replace(
        '<Route path="help" element={<AdminHelp />} />',
        '<Route path="help" element={<AdminHelp />} />\n' + routes
    );
    fs.writeFileSync(file, code);
}
