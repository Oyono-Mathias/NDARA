const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const oldAdminTab = `          {activeTab === 'admin' && (
            <div className="space-y-4">
                <div className="p-4 border border-slate-800/50 rounded-xl bg-slate-800/20">
                  <h4 className="text-sm font-bold text-white mb-3">Actions Rapides</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <ActionButton icon={LogIn} label="Se connecter en tant que" onClick={async () => {
                      if (await confirm("Se connecter en tant que cet utilisateur ?")) toast({ title: "Bientôt disponible" });
                    }} />
                    <ActionButton icon={Send} label="Notif Push" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Mail} label="Notif Interne" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Smartphone} label="Envoyer SMS" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Download} label="Export PDF" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={Download} label="Export RGPD" onClick={() => toast({ title: "Bientôt disponible" })} />
                    <ActionButton icon={GitMerge} label="Fusionner" onClick={async () => {
                      if (await confirm("Voulez-vous fusionner ce compte avec un autre ?")) toast({ title: "Bientôt disponible" });
                    }} />
                    <ActionButton icon={Archive} label="Archiver le compte" variant="danger" onClick={async () => {
                      if (await confirm("Voulez-vous archiver ce compte ?")) toast({ title: "Bientôt disponible" });
                    }} />
                  </div>
                </div>
            </div>
          )}`;

const newAdminTab = `          {activeTab === 'admin' && (
            <div className="space-y-6">
                <div className="p-4 border border-slate-800/50 rounded-xl bg-slate-800/20">
                  <h4 className="text-sm font-bold text-white mb-3">Actions Rapides - Globales</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    <ActionButton icon={BookOpen} label="Offrir une formation" onClick={() => handleQuickAction('gift_course')} />
                    <ActionButton icon={Archive} label="Retirer formation" onClick={() => handleQuickAction('remove_course')} variant="danger" />
                    <ActionButton icon={ShieldCheck} label="Offrir licence" onClick={() => handleQuickAction('gift_license')} />
                    <ActionButton icon={Archive} label="Retirer licence" onClick={() => handleQuickAction('remove_license')} variant="danger" />
                    <ActionButton icon={Wallet} label="Ajouter du crédit" onClick={() => handleQuickAction('add_credit')} />
                    <ActionButton icon={Wallet} label="Retirer du crédit" onClick={() => handleQuickAction('remove_credit')} variant="danger" />
                    <ActionButton icon={RefreshCcw} label="Réinitialiser progression" onClick={() => handleQuickAction('reset_progress')} variant="danger" />
                    <ActionButton icon={RefreshCcw} label="Réinitialiser quiz" onClick={() => handleQuickAction('reset_quiz')} variant="danger" />
                    <ActionButton icon={RefreshCcw} label="Réinitialiser devoirs" onClick={() => handleQuickAction('reset_assignments')} variant="danger" />
                    <ActionButton icon={FileText} label="Régénérer certificats" onClick={() => handleQuickAction('regenerate_certs')} />
                    <ActionButton icon={LogOut} label="Déconnecter appareils" onClick={() => handleQuickAction('disconnect_all')} variant="danger" />
                    <ActionButton icon={Key} label="Reset Mot de passe" onClick={() => handleQuickAction('reset_password')} variant="danger" />
                    <ActionButton icon={Mail} label="Envoyer Email" onClick={() => handleQuickAction('send_email')} />
                    <ActionButton icon={Bell} label="Envoyer Notification" onClick={() => handleQuickAction('send_notif')} />
                    <ActionButton icon={Download} label="Export PDF" onClick={() => handleQuickAction('export_pdf')} />
                    <ActionButton icon={Download} label="Export RGPD" onClick={() => handleQuickAction('export_gdpr')} />
                  </div>
                </div>

                <div className="p-4 border border-slate-800/50 rounded-xl bg-slate-800/20">
                  <h4 className="text-sm font-bold text-white mb-3">Gestion des Rôles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 mb-2">Rôles actuels</h5>
                      <div className="flex flex-wrap gap-2">
                        {member.roles && member.roles.length > 0 ? member.roles.map((r: string) => (
                          <div key={r} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center">
                            {r}
                            <button onClick={() => handleRolesUpdate(r, 'remove')} className="ml-2 hover:text-white">x</button>
                          </div>
                        )) : (
                          <div className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">{member.role || 'student'}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 mb-2">Ajouter un rôle</h5>
                      <div className="flex flex-wrap gap-2">
                        {['admin', 'instructor', 'student', 'moderator'].map(r => (
                          <button key={r} onClick={() => handleRolesUpdate(r, 'add')} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full transition">
                            + {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          )}`;

content = content.replace(oldAdminTab, newAdminTab);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
