const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'App.tsx');
let code = fs.readFileSync(file, 'utf8');

const importLayout = `const AmbassadorLayout = React.lazy(() => import('./views/ambassador/AmbassadorLayout').then(module => ({ default: module.AmbassadorLayout })));`;
if (!code.includes('AmbassadorLayout')) {
    code = code.replace(
        "const AdminLayout = React.lazy(() => import('./views/admin/AdminLayout').then(module => ({ default: module.AdminLayout })));",
        "const AdminLayout = React.lazy(() => import('./views/admin/AdminLayout').then(module => ({ default: module.AdminLayout })));\n" + importLayout
    );
}

const routeDef = `<Route path="/ambassador/*" element={<AmbassadorLayout />} />`;
if (!code.includes('path="/ambassador/*"')) {
    code = code.replace(
        '<Route path="/admin/*" element={<AdminLayout />} />',
        '<Route path="/admin/*" element={<AdminLayout />} />\n        ' + routeDef
    );
}

fs.writeFileSync(file, code);
console.log("App.tsx updated");
