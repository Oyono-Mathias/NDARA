const fs = require('fs');
const path = require('path');

// Update App.tsx
const appFile = path.join(__dirname, 'src', 'App.tsx');
let appCode = fs.readFileSync(appFile, 'utf8');

if (!appCode.includes('import { AdminCommissions }')) {
    appCode = appCode.replace(
        'const AdminInstructors = React.lazy(() => import(\'./views/admin/AdminInstructors\').then(module => ({ default: module.AdminInstructors })));',
        'const AdminInstructors = React.lazy(() => import(\'./views/admin/AdminInstructors\').then(module => ({ default: module.AdminInstructors })));\nconst AdminCommissions = React.lazy(() => import(\'./views/admin/AdminCommissions\').then(module => ({ default: module.AdminCommissions })));'
    );
    appCode = appCode.replace(
        '<Route path="settings" element={<AdminSettings />} />',
        '<Route path="settings" element={<AdminSettings />} />\n          <Route path="commissions" element={<AdminCommissions />} />'
    );
    fs.writeFileSync(appFile, appCode);
    console.log("App.tsx updated for admin commissions");
}

// Update AdminLayout sidebar or AdminSettings
const sidebarFile = path.join(__dirname, 'src', 'views', 'admin', 'AdminLayout.tsx');
let sidebarCode = fs.readFileSync(sidebarFile, 'utf8');
if (!sidebarCode.includes('/admin/commissions')) {
    sidebarCode = sidebarCode.replace(
        '{ name: \'Formateurs\', icon: GraduationCap, path: \'/admin/instructors\' },',
        '{ name: \'Formateurs\', icon: GraduationCap, path: \'/admin/instructors\' },\n    { name: \'Commissions\', icon: Percent, path: \'/admin/commissions\' },'
    );
    // add Percent to lucide-react imports if not there
    if(!sidebarCode.includes('Percent,')) {
      sidebarCode = sidebarCode.replace(
        'Settings, Menu, X, LogOut, Bell, Search, GraduationCap',
        'Settings, Menu, X, LogOut, Bell, Search, GraduationCap, Percent'
      );
    }
    fs.writeFileSync(sidebarFile, sidebarCode);
    console.log("AdminLayout updated");
}
