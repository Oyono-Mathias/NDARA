const fs = require('fs');
const file = 'src/views/ambassador/AmbassadorRewards.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { CSVLink }')) {
    code = code.replace(
        'import { format } from \'date-fns\';',
        'import { format } from \'date-fns\';\nimport { CSVLink } from "react-csv";\nimport { Download, FileText } from "lucide-react";'
    );
    
    code = code.replace(
        'setRewardHistory(rhSnap.docs.map(d => ({ id: d.id, ...d.data() })));',
        'const rh = rhSnap.docs.map(d => ({ id: d.id, ...d.data() }));\n      setRewardHistory(rh);\n      setExportData(rh.map((r: any) => ({\n        "Date": r.createdAt?.toDate ? format(r.createdAt.toDate(), \'dd/MM/yyyy HH:mm\') : \'\',\n        "Type": r.type,\n        "Description": r.description,\n        "Montant": r.amount\n      })));'
    );

    code = code.replace(
        'const [rewardHistory, setRewardHistory] = useState<any[]>([]);',
        'const [rewardHistory, setRewardHistory] = useState<any[]>([]);\n  const [exportData, setExportData] = useState<any[]>([]);'
    );

    code = code.replace(
        '<h2 className="text-sm font-black text-white uppercase tracking-widest">Historique des Récompenses</h2>',
        '<h2 className="text-sm font-black text-white uppercase tracking-widest">Historique des Récompenses</h2>\n            <div className="flex gap-2">\n              <CSVLink data={exportData} filename="ndara_recompenses.csv" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white" title="Exporter CSV">\n                <Download className="w-4 h-4" />\n              </CSVLink>\n              <button onClick={() => window.print()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white" title="Imprimer / PDF">\n                <FileText className="w-4 h-4" />\n              </button>\n            </div>'
    );

    code = code.replace(
        '<div className="p-6 border-b border-slate-800">',
        '<div className="p-6 border-b border-slate-800 flex justify-between items-center">'
    );

    fs.writeFileSync(file, code);
    console.log("Added export to AmbassadorRewards");
}
