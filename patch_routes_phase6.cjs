const fs = require('fs');
const path = require('path');

// Update App.tsx
const appFile = path.join(__dirname, 'src', 'App.tsx');
let appCode = fs.readFileSync(appFile, 'utf8');

if (!appCode.includes('import { AmbassadorRewards }')) {
    appCode = appCode.replace(
        'import { AmbassadorWallet } from \'./views/ambassador/AmbassadorWallet\';',
        'import { AmbassadorWallet } from \'./views/ambassador/AmbassadorWallet\';\nimport { AmbassadorRewards } from \'./views/ambassador/AmbassadorRewards\';\nimport { AmbassadorLeaderboard } from \'./views/ambassador/AmbassadorLeaderboard\';'
    );
    appCode = appCode.replace(
        '<Route path="wallet" element={<AmbassadorWallet />} />',
        '<Route path="wallet" element={<AmbassadorWallet />} />\n          <Route path="rewards" element={<AmbassadorRewards />} />\n          <Route path="leaderboard" element={<AmbassadorLeaderboard />} />'
    );
}

if (!appCode.includes('import { AdminAmbassadorProgram }')) {
    appCode = appCode.replace(
        'const AdminWithdrawals = React.lazy(() => import(\'./views/admin/AdminWithdrawals\').then(module => ({ default: module.AdminWithdrawals })));',
        'const AdminWithdrawals = React.lazy(() => import(\'./views/admin/AdminWithdrawals\').then(module => ({ default: module.AdminWithdrawals })));\nconst AdminAmbassadorProgram = React.lazy(() => import(\'./views/admin/AdminAmbassadorProgram\').then(module => ({ default: module.AdminAmbassadorProgram })));'
    );
    appCode = appCode.replace(
        '<Route path="withdrawals" element={<AdminWithdrawals />} />',
        '<Route path="withdrawals" element={<AdminWithdrawals />} />\n          <Route path="ambassador-program" element={<AdminAmbassadorProgram />} />'
    );
}

fs.writeFileSync(appFile, appCode);
console.log("App.tsx updated");

// Update Sidebar.tsx (Ambassador)
const sidebarFile = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let sidebarCode = fs.readFileSync(sidebarFile, 'utf8');
if (!sidebarCode.includes('/ambassador/rewards')) {
    sidebarCode = sidebarCode.replace(
        '{ icon: Wallet, label: \'Mon Portefeuille\', path: \'/ambassador/wallet\' },',
        '{ icon: Wallet, label: \'Mon Portefeuille\', path: \'/ambassador/wallet\' },\n    { icon: Gift, label: \'Récompenses & Niveaux\', path: \'/ambassador/rewards\' },\n    { icon: Trophy, label: \'Classement\', path: \'/ambassador/leaderboard\' },'
    );
    if (!sidebarCode.includes('Gift,')) {
        sidebarCode = sidebarCode.replace('Wallet', 'Wallet, Gift, Trophy');
    }
    fs.writeFileSync(sidebarFile, sidebarCode);
    console.log("Sidebar updated");
}

// Update AdminLayout.tsx
const adminSidebarFile = path.join(__dirname, 'src', 'views', 'admin', 'AdminLayout.tsx');
let adminSidebarCode = fs.readFileSync(adminSidebarFile, 'utf8');
if (!adminSidebarCode.includes('/admin/ambassador-program')) {
    adminSidebarCode = adminSidebarCode.replace(
        '{ name: \'Retraits\', icon: ArrowDownRight, path: \'/admin/withdrawals\' },',
        '{ name: \'Retraits\', icon: ArrowDownRight, path: \'/admin/withdrawals\' },\n    { name: \'Prog. Ambassadeurs\', icon: Trophy, path: \'/admin/ambassador-program\' },'
    );
    if (!adminSidebarCode.includes('Trophy,')) {
         adminSidebarCode = adminSidebarCode.replace('ArrowDownRight', 'ArrowDownRight, Trophy');
    }
    fs.writeFileSync(adminSidebarFile, adminSidebarCode);
    console.log("AdminLayout updated");
}
