const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorProfile.tsx', 'utf8');

const affiliation = `
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Trophy className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Code : <strong className="text-emerald-400">{profile.referralCode || 'Non généré'}</strong></span>
            </div>
`;

code = code.replace(
  '<div className="flex items-center gap-3 text-slate-300 text-sm">\n              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />',
  `${affiliation}\n            <div className="flex items-center gap-3 text-slate-300 text-sm">\n              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />`
);

fs.writeFileSync('src/views/admin/AdminAmbassadorProfile.tsx', code);
