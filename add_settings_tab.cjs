const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorProgram.tsx', 'utf8');

code = code.replace(
    /const \[activeTab, setActiveTab\] = useState<'levels' \| 'badges' \| 'challenges'>\('levels'\);/g,
    `const [activeTab, setActiveTab] = useState<'levels' | 'badges' | 'challenges' | 'settings'>('levels');
  const [commSettings, setCommSettings] = useState<any>({
    courseCommission: 10,
    ebookCommission: 10,
    certificationCommission: 10,
    instructorLicenseCommission: 10,
    expertLicenseCommission: 10,
    marketplaceCommission: 10,
    premiumSubscriptionCommission: 10,
    p2pCommission: 10
  });`
);

code = code.replace(
    /const loadData = async \(\) => \{[\s\S]*?try \{/g,
    `const loadData = async () => {
    setLoading(true);
    try {
      const setSnap = await getDocs(query(collection(db, 'commission_settings')));
      const defaults = setSnap.docs.find(d => d.id === 'default');
      if (defaults) {
         setCommSettings(defaults.data());
      }`
);

code = code.replace(
    /<button onClick=\{\(\) => setActiveTab\('challenges'\)\}[\s\S]*?<\/button>/,
    `<button onClick={() => setActiveTab('challenges')} className={\`px-4 py-2 font-bold uppercase tracking-widest text-sm rounded-lg \${activeTab === 'challenges' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}\`}>Défis</button>
        <button onClick={() => setActiveTab('settings')} className={\`px-4 py-2 font-bold uppercase tracking-widest text-sm rounded-lg \${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}\`}>Paramètres</button>`
);

const settingsTabUI = `
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Commissions par Type de Vente (%)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'courseCommission', label: 'Formation' },
                  { id: 'ebookCommission', label: 'Ebook' },
                  { id: 'certificationCommission', label: 'Certification' },
                  { id: 'instructorLicenseCommission', label: 'Licence Formateur' },
                  { id: 'expertLicenseCommission', label: 'Licence Expert' },
                  { id: 'marketplaceCommission', label: 'Marketplace' },
                  { id: 'premiumSubscriptionCommission', label: 'Abonnement Premium' },
                  { id: 'p2pCommission', label: 'P2P (Frais Plateforme)' }
                ].map(item => (
                  <div key={item.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                    <label className="text-sm font-bold text-slate-300 block mb-2">{item.label}</label>
                    <input 
                      type="number" 
                      value={commSettings[item.id] || 0} 
                      onChange={(e) => setCommSettings({...commSettings, [item.id]: parseFloat(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={async () => {
                  try {
                    await setDoc(doc(db, 'commission_settings', 'default'), commSettings, {merge: true});
                    toast({ title: 'Paramètres sauvegardés' });
                  } catch(e) {
                    toast({ title: 'Erreur', variant: 'destructive' });
                  }
                }} 
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-xl"
              >
                Sauvegarder les commissions
              </button>
            </div>
          )}
`;

code = code.replace(/<div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">/, `<div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">\n${settingsTabUI}`);

fs.writeFileSync('src/views/admin/AdminAmbassadorProgram.tsx', code);
