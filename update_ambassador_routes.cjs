const fs = require('fs');
const path = require('path');

// Update Sidebar.tsx
const sidebarFile = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let sidebarCode = fs.readFileSync(sidebarFile, 'utf8');

if (!sidebarCode.includes('/ambassador/referrals')) {
    sidebarCode = sidebarCode.replace(
        '{ icon: PieChart, label: \'Tableau de bord\', path: \'/ambassador\' },',
        '{ icon: PieChart, label: \'Tableau de bord\', path: \'/ambassador\' },\n    { icon: Users, label: \'Mes Filleuls\', path: \'/ambassador/referrals\' },'
    );
    fs.writeFileSync(sidebarFile, sidebarCode);
    console.log("Sidebar updated");
}

// Update App.tsx
const appFile = path.join(__dirname, 'src', 'App.tsx');
let appCode = fs.readFileSync(appFile, 'utf8');

if (!appCode.includes('import { AmbassadorReferrals }')) {
    appCode = appCode.replace(
        'import { AmbassadorDashboard } from \'./views/ambassador/AmbassadorDashboard\';',
        'import { AmbassadorDashboard } from \'./views/ambassador/AmbassadorDashboard\';\nimport { AmbassadorReferrals } from \'./views/ambassador/AmbassadorReferrals\';'
    );
    appCode = appCode.replace(
        '<Route index element={<AmbassadorDashboard />} />',
        '<Route index element={<AmbassadorDashboard />} />\n          <Route path="referrals" element={<AmbassadorReferrals />} />'
    );
    fs.writeFileSync(appFile, appCode);
    console.log("App.tsx updated");
}
