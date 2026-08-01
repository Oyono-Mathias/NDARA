const fs = require('fs');
const content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');
const permissionsTab = `
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'canPurchase', label: 'Peut acheter une formation' },
                  { key: 'canSell', label: 'Peut vendre une formation' },
                  { key: 'canPublish', label: 'Peut publier une formation' },
                  { key: 'canCreateQuiz', label: 'Peut créer un quiz' },
                  { key: 'canCreateAssignment', label: 'Peut créer un devoir' },
                  { key: 'canAnswerQuestions', label: 'Peut répondre aux questions' },
                  { key: 'canPublishAnnouncements', label: 'Peut publier des annonces' },
                  { key: 'canPublishReviews', label: 'Peut publier des avis' },
                  { key: 'canSendMessages', label: 'Peut envoyer des messages' },
                  { key: 'canReceiveMessages', label: 'Peut recevoir des messages' },
                  { key: 'canWithdraw', label: 'Peut retirer de l\\'argent' },
                  { key: 'canDeposit', label: 'Peut déposer de l\\'argent' },
                  { key: 'canReceivePayments', label: 'Peut recevoir des paiements' },
                  { key: 'canReceiveCertificates', label: 'Peut recevoir des certificats' },
                  { key: 'canUseAI', label: 'Peut utiliser l\\'IA' },
                  { key: 'canBeAmbassador', label: 'Peut devenir ambassadeur' },
                  { key: 'canUseWallet', label: 'Peut utiliser le Wallet' },
                  { key: 'canUseMarketplace', label: 'Peut utiliser le Marketplace' },
                  { key: 'canAccessP2P', label: 'Peut accéder au P2P' }
                ].map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-800/50 bg-slate-800/20">
                    <span className="text-sm text-slate-300 font-medium">{perm.label}</span>
                    <button 
                      onClick={() => handleTogglePermission(perm.key, !!member?.permissions?.[perm.key])}
                      className={clsx(
                        "w-10 h-6 rounded-full transition-colors relative", 
                        member?.permissions?.[perm.key] ? "bg-emerald-500" : "bg-slate-700"
                      )}
                    >
                      <span className={clsx(
                        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform", 
                        member?.permissions?.[perm.key] ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
`;
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content.replace("{activeTab === 'admin' && (", permissionsTab + "          {activeTab === 'admin' && ("));
