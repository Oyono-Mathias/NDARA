const fs = require('fs');
const path = require('path');

// Update Sidebar.tsx
const sidebarFile = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let sidebarCode = fs.readFileSync(sidebarFile, 'utf8');

if (!sidebarCode.includes('/ambassador/wallet')) {
    sidebarCode = sidebarCode.replace(
        '{ icon: DollarSign, label: \'Commissions\', path: \'/ambassador/commissions\' },',
        '{ icon: DollarSign, label: \'Commissions\', path: \'/ambassador/commissions\' },\n    { icon: Wallet, label: \'Mon Portefeuille\', path: \'/ambassador/wallet\' },'
    );
    if (!sidebarCode.includes('Wallet,')) {
        sidebarCode = sidebarCode.replace('DollarSign', 'DollarSign, Wallet');
    }
    fs.writeFileSync(sidebarFile, sidebarCode);
    console.log("Sidebar updated for ambassador wallet");
}

// Update App.tsx
const appFile = path.join(__dirname, 'src', 'App.tsx');
let appCode = fs.readFileSync(appFile, 'utf8');

if (!appCode.includes('import { AmbassadorWallet }')) {
    appCode = appCode.replace(
        'import { AmbassadorCommissions } from \'./views/ambassador/AmbassadorCommissions\';',
        'import { AmbassadorCommissions } from \'./views/ambassador/AmbassadorCommissions\';\nimport { AmbassadorWallet } from \'./views/ambassador/AmbassadorWallet\';'
    );
    appCode = appCode.replace(
        '<Route path="commissions" element={<AmbassadorCommissions />} />',
        '<Route path="commissions" element={<AmbassadorCommissions />} />\n          <Route path="wallet" element={<AmbassadorWallet />} />'
    );
    fs.writeFileSync(appFile, appCode);
    console.log("App.tsx updated for ambassador wallet");
}
