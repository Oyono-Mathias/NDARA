const fs = require('fs');
const file = 'src/views/admin/AdminLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

const adminRoutes = `
    { name: "RETRAITS", path: "/admin/withdrawals", icon: ArrowDownRight },
    { name: "AMBASSADEURS", path: "/admin/ambassador-program", icon: Trophy },
    { name: "MARKETING", path: "/admin/marketing-assets", icon: Target },
`;

if (!code.includes('/admin/marketing-assets')) {
    code = code.replace(
        '{ name: "SUPPORT", path: "/admin/help", icon: Headphones },',
        '{ name: "SUPPORT", path: "/admin/help", icon: Headphones },' + adminRoutes
    );
    
    // add missing imports
    code = code.replace(
        'Headphones,',
        'Headphones, ArrowDownRight, Trophy, Target,'
    );
    fs.writeFileSync(file, code);
}
