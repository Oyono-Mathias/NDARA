const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminTransactions.tsx', 'utf8');

const importToast = `import { useToast } from '../../hooks/use-toast';`;
if (!code.includes('useToast')) {
  code = code.replace("import { EmptyState, NdaraSkeleton } from './AdminSupport';", "import { EmptyState, NdaraSkeleton } from './AdminSupport';\n" + importToast);
}

const exportFunction = `
  const { toast } = useToast();
  
  const handleExportToDrive = async () => {
    try {
      toast({ title: 'Export en cours', description: 'Génération du registre comptable...' });
      
      const csvContent = "ID,Type,Montant,Date\\n" + ledger.map(l => \`\${l.id},\${l.type || 'SYSTEM_TRANSACTION'},\${l.amount},\${new Date(l.createdAt?.toDate ? l.createdAt.toDate() : l.createdAt || 0).toLocaleDateString('fr-FR')}\`).join('\\n');
      
      const response = await fetch('/api/admin/drive/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: \`Registre_Financier_\${new Date().toISOString().split('T')[0]}.csv\`,
          content: csvContent,
          mimeType: 'text/csv'
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      toast({ title: 'Succès', description: 'Registre exporté sur Google Drive !' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };
`;

code = code.replace('const [processing, setProcessing] = useState(false);', 'const [processing, setProcessing] = useState(false);\n' + exportFunction);

code = code.replace(
  '<Download className="h-4 w-4" /> Imprimer le Registre',
  '<Download className="h-4 w-4" /> Exporter vers Drive'
);

code = code.replace(
  '<button className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-slate-900/50 w-full sm:w-auto">',
  '<button onClick={handleExportToDrive} className="flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-slate-900/50 w-full sm:w-auto">'
);

fs.writeFileSync('src/views/admin/AdminTransactions.tsx', code);
console.log("Patched AdminTransactions.tsx");
