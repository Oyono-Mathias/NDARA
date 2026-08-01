const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const targetWalletTab = `          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Portefeuille & Transactions</h3>
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-emerald-400">Solde Wallet</span>
                  <span className="text-2xl font-black text-emerald-400">{member.walletBalance || 0} XAF</span>
                </div>`;

const newTabsJSX = `          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Portefeuille & Transactions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex flex-col justify-center">
                    <span className="text-sm font-bold text-emerald-400 mb-1">Solde Actuel</span>
                    <span className="text-2xl font-black text-emerald-400">{member.walletBalance || 0} XAF</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col justify-center">
                    <span className="text-sm font-bold text-slate-400 mb-1">Solde Bloqué</span>
                    <span className="text-xl font-bold text-slate-300">0 XAF</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col justify-center">
                    <span className="text-sm font-bold text-slate-400 mb-1">Revenus (Commissions)</span>
                    <span className="text-xl font-bold text-slate-300">0 XAF</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                  <button onClick={() => handleWalletTabAction('manual_tx')} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/30">Créditer</button>
                  <button onClick={() => handleWalletTabAction('manual_tx')} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500/30">Retirer</button>
                  <button onClick={() => handleWalletTabAction('freeze')} className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-600">Geler</button>
                  <button onClick={() => handleWalletTabAction('correct')} className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-600">Corriger</button>
                </div>`;

content = content.replace(targetWalletTab, newTabsJSX);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
