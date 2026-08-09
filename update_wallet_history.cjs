const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorWallet.tsx', 'utf8');

code = code.replace(
    /const \[searchTerm, setSearchTerm\] = useState\(''\);/,
    `const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'wallet' | 'history'>('wallet');
  const [historyEvents, setHistoryEvents] = useState<any[]>([]);`
);

code = code.replace(
    /setWithdrawals\(history\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\)\);/,
    `setWithdrawals(history.docs.map(d => ({ id: d.id, ...d.data() })));
       
       // Load history
       firebaseUser.getIdToken().then(token => {
           fetch('/api/ambassador/history', {
             headers: { 'Authorization': \`Bearer \${token}\` }
           }).then(res => res.json()).then(data => {
             if(data.events) setHistoryEvents(data.events);
           }).catch(console.error);
       });`
);

const historyUI = `
      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('wallet')} className={\`px-6 py-3 font-bold text-sm rounded-xl transition-colors \${activeTab === 'wallet' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}\`}>Portefeuille & Retraits</button>
        <button onClick={() => setActiveTab('history')} className={\`px-6 py-3 font-bold text-sm rounded-xl transition-colors \${activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}\`}>Historique Détaillé</button>
      </div>

      {activeTab === 'history' && (
        <div className="bg-[#111827] border border-[#1E293B] rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Historique des Événements</h2>
          <div className="space-y-4">
            {historyEvents.map((evt, idx) => (
              <div key={evt.id + '-' + idx} className="bg-slate-800/50 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${
                    evt.type === 'clic' ? 'bg-blue-500/20 text-blue-500' :
                    evt.type === 'inscription' ? 'bg-emerald-500/20 text-emerald-500' :
                    evt.type === 'achat' ? 'bg-pink-500/20 text-pink-500' :
                    evt.type === 'commission' ? 'bg-yellow-500/20 text-yellow-500' :
                    evt.type === 'retrait' ? 'bg-purple-500/20 text-purple-500' :
                    'bg-red-500/20 text-red-500'
                  }\`}>
                    {evt.type === 'clic' && <ArrowDownRight className="w-5 h-5" />}
                    {evt.type === 'inscription' && <CheckCircle2 className="w-5 h-5" />}
                    {evt.type === 'achat' && <DollarSign className="w-5 h-5" />}
                    {evt.type === 'commission' && <Banknote className="w-5 h-5" />}
                    {evt.type === 'retrait' && <CreditCard className="w-5 h-5" />}
                    {(evt.type === 'annulation' || evt.type === 'remboursement' || evt.type === 'annulation_commission') && <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-white uppercase text-sm tracking-widest">{evt.type.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-400">{format(new Date(evt.date), 'dd MMM yyyy à HH:mm', { locale: fr })}</p>
                  </div>
                </div>
                <div className="text-right">
                   {(evt.type === 'commission' || evt.type === 'retrait' || evt.type === 'achat' || evt.type === 'annulation_commission') && (
                     <p className={\`font-black \${evt.type === 'annulation_commission' || evt.type === 'retrait' ? 'text-red-400' : 'text-emerald-400'}\`}>
                       {evt.type === 'annulation_commission' || evt.type === 'retrait' ? '-' : '+'}{(evt.data.amount || evt.data.commission || 0).toLocaleString()} XAF
                     </p>
                   )}
                   {evt.type === 'inscription' && <p className="text-sm font-bold text-slate-300">Nouveau Filleul</p>}
                   {evt.type === 'clic' && <p className="text-sm font-bold text-slate-300">Visite</p>}
                </div>
              </div>
            ))}
            {historyEvents.length === 0 && <p className="text-center text-slate-500 py-8">Aucun événement enregistré.</p>}
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
`;

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-6">/, historyUI + '\n<div className="grid grid-cols-1 md:grid-cols-3 gap-6">');
code = code.replace(/<\/div>\s*<\/div>\s*\)\s*;\s*\}\s*$/, '</div>\n        )}\n      </div>\n  );\n}\n');

// Make sure DollarSign is imported
code = code.replace(/import \{ Loader2, Wallet/, "import { Loader2, Wallet, DollarSign");

fs.writeFileSync('src/views/ambassador/AmbassadorWallet.tsx', code);
