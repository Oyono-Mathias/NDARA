const fs = require('fs');
const file = 'src/views/ambassador/AmbassadorMarketing.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('onClick={() => window.print()}')) {
    code = code.replace(
        '<CSVLink data={campaigns} filename="ndara_campagnes.csv" className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">Exporter CSV</CSVLink>',
        `<div className="flex gap-2">
                <CSVLink data={campaigns} filename="ndara_campagnes.csv" className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 flex items-center gap-2"><Download className="w-4 h-4"/> CSV / Excel</CSVLink>
                <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 flex items-center gap-2"><FileText className="w-4 h-4"/> PDF / Imprimer</button>
              </div>`
    );
    fs.writeFileSync(file, code);
}
