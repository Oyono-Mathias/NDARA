const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const newTabs = `          {activeTab === 'license' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Licences Formateur</h3>
              {isTabLoading ? <NdaraSkeleton className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={BookOpen} title="Aucune licence" /> : (
                tabData.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Licence {item.type}</div>
                      <div className="text-xs text-slate-400">Date: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : '-'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleLicenseMarketAction('allow_resale', item)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Autoriser revente</button>
                      <button onClick={() => handleLicenseMarketAction('block_resale', item)} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">Bloquer revente</button>
                      <button onClick={() => handleLicenseMarketAction('force_transfer', item)} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">Transférer</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Marketplace des Licences</h3>
              {isTabLoading ? <NdaraSkeleton className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={Store} title="Aucune annonce en marketplace" /> : (
                tabData.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Licence en vente ({item.price} XAF)</div>
                      <div className="text-xs text-slate-400">Statut: {item.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleLicenseMarketAction('suspend_sales', item)} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">Suspendre</button>
                      <button onClick={() => handleLicenseMarketAction('reactivate_sales', item)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Réactiver</button>
                      <button onClick={() => handleLicenseMarketAction('cancel_sale', item)} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">Annuler Vente</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'p2p' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Marché P2P</h3>
              <div className="flex gap-2 mb-4">
                <button onClick={() => handleP2PAction('allow_p2p')} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Autoriser P2P</button>
                <button onClick={() => handleP2PAction('block_p2p')} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">Bloquer P2P</button>
              </div>
              {isTabLoading ? <NdaraSkeleton className="h-32 w-full rounded-xl" /> : tabData.length === 0 ? <EmptyState icon={RefreshCw} title="Aucune annonce P2P" /> : (
                tabData.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-white">Annonce {item.type === 'sell' ? 'Vente' : 'Achat'} {item.amount} XAF</div>
                        <div className="text-xs text-slate-400">Taux: {item.rate}</div>
                      </div>
                      <div className="text-xs font-bold px-2 py-1 bg-slate-800 rounded">{item.status}</div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleP2PAction('suspend_ads', item)} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">Suspendre</button>
                      <button onClick={() => handleP2PAction('delete_ad', item)} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">Supprimer</button>
                      <button onClick={() => handleP2PAction('unblock_funds', item)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Débloquer fonds</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}`;

const targetActivity = `          {activeTab === 'activity' && (`;

content = content.replace(targetActivity, newTabs + '\n\n' + targetActivity);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
