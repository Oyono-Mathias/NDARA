const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'ambassador', 'AmbassadorDashboard.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    "<span className={\\`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest \\${ambassadorData.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}\\`}>",
    "<span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${ambassadorData.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>"
);

fs.writeFileSync(file, code);
