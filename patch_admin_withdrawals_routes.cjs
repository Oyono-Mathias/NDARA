const fs = require('fs');
const path = require('path');

// Update App.tsx
const appFile = path.join(__dirname, 'src', 'App.tsx');
let appCode = fs.readFileSync(appFile, 'utf8');

if (!appCode.includes('import { AdminWithdrawals }')) {
    appCode = appCode.replace(
        'const AdminCommissions = React.lazy(() => import(\'./views/admin/AdminCommissions\').then(module => ({ default: module.AdminCommissions })));',
        'const AdminCommissions = React.lazy(() => import(\'./views/admin/AdminCommissions\').then(module => ({ default: module.AdminCommissions })));\nconst AdminWithdrawals = React.lazy(() => import(\'./views/admin/AdminWithdrawals\').then(module => ({ default: module.AdminWithdrawals })));'
    );
    appCode = appCode.replace(
        '<Route path="commissions" element={<AdminCommissions />} />',
        '<Route path="commissions" element={<AdminCommissions />} />\n          <Route path="withdrawals" element={<AdminWithdrawals />} />'
    );
    fs.writeFileSync(appFile, appCode);
    console.log("App.tsx updated for admin withdrawals");
}

// Update AdminLayout sidebar
const sidebarFile = path.join(__dirname, 'src', 'views', 'admin', 'AdminLayout.tsx');
let sidebarCode = fs.readFileSync(sidebarFile, 'utf8');
if (!sidebarCode.includes('/admin/withdrawals')) {
    sidebarCode = sidebarCode.replace(
        '{ name: \'Commissions\', icon: Percent, path: \'/admin/commissions\' },',
        '{ name: \'Commissions\', icon: Percent, path: \'/admin/commissions\' },\n    { name: \'Retraits\', icon: ArrowDownRight, path: \'/admin/withdrawals\' },'
    );
    if (!sidebarCode.includes('ArrowDownRight,')) {
        sidebarCode = sidebarCode.replace('Percent', 'Percent, ArrowDownRight');
    }
    fs.writeFileSync(sidebarFile, sidebarCode);
    console.log("AdminLayout updated for admin withdrawals");
}
