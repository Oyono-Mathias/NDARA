const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

// For the UI rendering
content = content.replace(
  /onClick=\{\(\) => handleTogglePermission\(perm.key, !!member\?\.permissions\?\.\[perm.key\]\)\}/g,
  "onClick={() => { const isActive = member?.permissions?.[perm.key] !== false; handleTogglePermission(perm.key, isActive); }}"
);

content = content.replace(
  /className=\{clsx\(\s*"w-10 h-6 rounded-full transition-colors relative",\s*member\?\.permissions\?\.\[perm.key\] \? "bg-emerald-500" : "bg-slate-700"\s*\)\}/g,
  `className={clsx(
                        "w-10 h-6 rounded-full transition-colors relative", 
                        member?.permissions?.[perm.key] !== false ? "bg-emerald-500" : "bg-slate-700"
                      )}`
);

content = content.replace(
  /className=\{clsx\(\s*"absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",\s*member\?\.permissions\?\.\[perm.key\] \? "translate-x-4" : "translate-x-0"\s*\)\}/g,
  `className={clsx(
                        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", 
                        member?.permissions?.[perm.key] !== false ? "translate-x-4" : "translate-x-0"
                      )}`
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
