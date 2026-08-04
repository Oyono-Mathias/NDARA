const fs = require('fs');

let layout = fs.readFileSync('src/views/ambassador/AmbassadorLayout.tsx', 'utf8');
layout = layout.replace(
  "const isAmbassador = currentUser.roles?.includes('ambassador') || currentUser.role === 'ambassador' || ['admin', 'superadmin'].includes(currentUser.role);",
  "const isAmbassador = currentUser.role === 'ambassador' || ['admin', 'superadmin'].includes(currentUser.role);"
);
fs.writeFileSync('src/views/ambassador/AmbassadorLayout.tsx', layout);

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  "{currentUser?.roles?.includes('ambassador') || currentUser?.role === 'ambassador' || ['admin', 'superadmin'].includes(currentUser?.role) ? (",
  "{currentUser?.role === 'ambassador' || ['admin', 'superadmin'].includes(currentUser?.role) ? ("
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

// Check if RoleGuard uses roles
let roleGuard = fs.readFileSync('src/guards/RoleGuard.tsx', 'utf8');
roleGuard = roleGuard.replace(
  "if (!appUser || !allowedRoles.includes(appUser.role)) {",
  "if (!appUser || (!allowedRoles.includes(appUser.role) && !appUser.roles?.some(r => allowedRoles.includes(r)))) {"
);
fs.writeFileSync('src/guards/RoleGuard.tsx', roleGuard);

