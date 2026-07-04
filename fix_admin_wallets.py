import re

with open('src/views/admin/AdminTransactions.tsx', 'r') as f:
    content = f.read()

# Add wallets state
state_inject = """
  const [wallets, setWallets] = useState<any[]>([]);
"""

content = content.replace("  const [ledger, setLedger] = useState<any[]>([]);", "  const [ledger, setLedger] = useState<any[]>([]);\n" + state_inject)

# Load wallets
load_logic = """
    const qWallets = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubWallets = onSnapshot(qWallets, (snap) => {
      const data: any[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setWallets(data);
    }, (err) => console.error("Erreur sync wallets:", err));
"""

content = content.replace("const unsubLedger = onSnapshot(qLedger", load_logic + "\n    const unsubLedger = onSnapshot(qLedger")
content = content.replace("unsubLedger();", "unsubLedger();\n      unsubWallets();")

# Freeze / Unfreeze wallet handler
freeze_logic = """
  const toggleWalletStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
    if (!window.confirm(`Voulez-vous vraiment ${newStatus === 'locked' ? 'geler' : 'réactiver'} ce portefeuille ?`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { walletStatus: newStatus });
      alert(`Portefeuille ${newStatus === 'locked' ? 'gelé' : 'réactivé'} avec succès.`);
    } catch (e: any) {
      alert("Erreur: " + e.message);
    }
  };
"""

content = content.replace("const handleValidatePayout", freeze_logic + "\n  const handleValidatePayout")

# Update tabs type
content = content.replace("<'payments' | 'payouts' | 'ledger'>('payments')", "<'payments' | 'payouts' | 'ledger' | 'wallets'>('payments')")

# Add wallets tab UI
tab_button = """
              <button 
                onClick={() => setActiveTab('wallets')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'wallets' ? "bg-slate-800 text-purple-400 shadow-sm border border-slate-700/50" : "text-purple-500/50 hover:text-purple-400/80 hover:bg-slate-800/30"
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> Portefeuilles ({wallets.length})
              </button>
"""

content = content.replace("</button>\n            </div>", "</button>\n" + tab_button + "\n            </div>")

wallets_render = """
        {activeTab === 'wallets' && (
          <div className="space-y-4">
            {wallets.length === 0 ? <EmptyState icon={ShieldCheck} title="Aucun portefeuille" /> : wallets.map(wallet => (
              <div key={wallet.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-800/20 border border-slate-700/50 rounded-2xl gap-4 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wallet.walletStatus === 'locked' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{wallet.fullName || wallet.email}</h3>
                    <p className="text-sm text-slate-400">UID: {wallet.id}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Statut: <span className={wallet.walletStatus === 'locked' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{wallet.walletStatus === 'locked' ? 'GELÉ' : 'ACTIF'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xl font-bold text-white">{(wallet.balance || 0).toLocaleString()} <span className="text-sm text-emerald-500 font-normal">XAF</span></div>
                  <div className="text-sm text-slate-400">Bloqué: {(wallet.pendingBalance || 0).toLocaleString()} XAF</div>
                  <button 
                    onClick={() => toggleWalletStatus(wallet.id, wallet.walletStatus || 'active')}
                    className={`mt-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                      wallet.walletStatus === 'locked' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {wallet.walletStatus === 'locked' ? 'Réactiver le portefeuille' : 'Geler le portefeuille'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
"""

content = content.replace("        {activeTab === 'ledger' && (", wallets_render + "\n        {activeTab === 'ledger' && (")


with open('src/views/admin/AdminTransactions.tsx', 'w') as f:
    f.write(content)
