const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const uiToAdd = `
              <div className="mt-6 border border-slate-800 rounded-xl p-4 bg-slate-800/20">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-sm font-bold text-white">Actions Rapides</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton icon={User} label="Impersonation" onClick={async () => {
                    if (await confirm("Se connecter en tant que cet utilisateur ?")) {
                      try {
                        setIsMutating(true);
                        const res = await fetch('/api/admin/impersonate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ uid: member.id })
                        });
                        const data = await res.json();
                        if (data.token) {
                          await authService.loginWithToken(data.token);
                          toast({ title: "Connecté en tant que " + (member.fullName || member.email) });
                          window.location.href = '/dashboard';
                        } else {
                          throw new Error("Failed to get token");
                        }
                      } catch (e) {
                        toast({ title: "Erreur lors de l'impersonation", variant: "destructive" });
                      } finally {
                        setIsMutating(false);
                      }
                    }
                  }} />
                  <ActionButton icon={Copy} label="Copier UID" onClick={() => {
                    navigator.clipboard.writeText(member.id);
                    toast({ title: "UID copié" });
                  }} />
                  <ActionButton icon={Copy} label="Copier Email" onClick={() => {
                    navigator.clipboard.writeText(member.email || '');
                    toast({ title: "Email copié" });
                  }} />
                </div>
              </div>
`;

content = content.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*\)\}\s*\{activeTab === 'formations' && \(/,
  `</div>\n              </div>\n${uiToAdd}\n            </div>\n          )}\n          {activeTab === 'formations' && (`
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
