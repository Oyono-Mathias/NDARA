const fs = require('fs');
const file = 'src/views/ambassador/AmbassadorLeaderboard.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { CSVLink }')) {
    code = code.replace(
        'import { useAuth } from \'../../contexts/AuthContext\';',
        'import { useAuth } from \'../../contexts/AuthContext\';\nimport { CSVLink } from "react-csv";\nimport { Download, FileText } from "lucide-react";'
    );
    
    code = code.replace(
        'const [sortBy, setSortBy] = useState<\'totalVolume\' | \'totalReferrals\'>(\'totalVolume\');',
        'const [sortBy, setSortBy] = useState<\'totalVolume\' | \'totalReferrals\'>(\'totalVolume\');\n  const [exportData, setExportData] = useState<any[]>([]);'
    );

    code = code.replace(
        'setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));',
        'const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));\n      setLeaders(docs);\n      setExportData(docs.map((d: any, idx) => ({\n        "Rang": idx + 1,\n        "Ambassadeur": d.displayName,\n        "Niveau": d.level,\n        "Filleuls": d.totalReferrals,\n        "CA Généré": d.totalVolume\n      })));'
    );

    code = code.replace(
        'Par Filleuls\n        </button>\n      </div>',
        'Par Filleuls\n        </button>\n      </div>\n\n      <div className="flex justify-end gap-3">\n        <CSVLink \n          data={exportData} \n          filename={`ndara_classement.csv`}\n          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-xs"\n        >\n          <Download className="w-4 h-4" /> CSV / Excel\n        </CSVLink>\n        <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-xs">\n          <FileText className="w-4 h-4" /> PDF / Imprimer\n        </button>\n      </div>'
    );
    fs.writeFileSync(file, code);
    console.log("Added export to AmbassadorLeaderboard");
}
