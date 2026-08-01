const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const regex = /\{isTabLoading \? <NdaraSkeleton className="h-32 w-full rounded-xl" \/> : extraData\.length === 0 \? <EmptyState icon=\{Lock\} title="Aucun fond bloqué" \/> : \([\s\S]*?\)\}\s*<\/div>\s*<\/div>\s*\)\}/;

const replacement = `{isTabLoading ? <NdaraSkeleton className="h-32 w-full rounded-xl" /> : extraData.length === 0 ? <EmptyState icon={Lock} title="Aucun fond bloqué" /> : (
                  <div className="space-y-3">
                    {extraData.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-800/50 bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-white">{item.reason || 'Gel de fonds'}</h4>
                          <p className="text-xs text-slate-400">Date: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}</p>
                          <div className="mt-1">
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                              item.status === 'released' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                            )}>
                              {item.status === 'released' ? 'Dégelé' : 'Gelé'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-white">{item.amount} XAF</span>
                          {item.status === 'frozen' && (
                            <button 
                              onClick={() => handleWalletTabAction('unfreeze', item)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs rounded-lg transition-colors border border-emerald-500/20"
                            >
                              Dégeler
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
