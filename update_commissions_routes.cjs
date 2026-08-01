const fs = require('fs');
const path = require('path');

// Update Sidebar.tsx
const sidebarFile = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let sidebarCode = fs.readFileSync(sidebarFile, 'utf8');

if (!sidebarCode.includes('/ambassador/commissions')) {
    sidebarCode = sidebarCode.replace(
        '{ icon: Users, label: \'Mes Filleuls\', path: \'/ambassador/referrals\' },',
        '{ icon: Users, label: \'Mes Filleuls\', path: \'/ambassador/referrals\' },\n    { icon: DollarSign, label: \'Commissions\', path: \'/ambassador/commissions\' },'
    );
    fs.writeFileSync(sidebarFile, sidebarCode);
    console.log("Sidebar updated");
}

// Update App.tsx
const appFile = path.join(__dirname, 'src', 'App.tsx');
let appCode = fs.readFileSync(appFile, 'utf8');

if (!appCode.includes('import { AmbassadorCommissions }')) {
    appCode = appCode.replace(
        'import { AmbassadorReferrals } from \'./views/ambassador/AmbassadorReferrals\';',
        'import { AmbassadorReferrals } from \'./views/ambassador/AmbassadorReferrals\';\nimport { AmbassadorCommissions } from \'./views/ambassador/AmbassadorCommissions\';'
    );
    appCode = appCode.replace(
        '<Route path="referrals" element={<AmbassadorReferrals />} />',
        '<Route path="referrals" element={<AmbassadorReferrals />} />\n          <Route path="commissions" element={<AmbassadorCommissions />} />'
    );
    fs.writeFileSync(appFile, appCode);
    console.log("App.tsx updated");
}
