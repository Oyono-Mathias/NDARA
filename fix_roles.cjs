const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

// Add 'roles' to TabId type
content = content.replace(
  /type TabId = 'info' \| 'formations' \| 'quizzes' \| 'certificats' \| 'wallet' \| 'license' \| 'market' \| 'p2p' \| 'permissions' \| 'stats' \| 'activity';/,
  "type TabId = 'info' | 'formations' | 'quizzes' | 'certificats' | 'wallet' | 'license' | 'market' | 'p2p' | 'permissions' | 'stats' | 'activity' | 'roles';"
);

// Add 'roles' to tabs array
content = content.replace(
  /\{ id: 'permissions', label: 'Permissions', icon: ToggleRight \},/,
  `{ id: 'roles', label: 'Rôles', icon: ShieldCheck },
    { id: 'permissions', label: 'Permissions', icon: ToggleRight },`
);

// Add roles UI
const rolesUI = `
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Gestion des Rôles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['student', 'instructor', 'expert', 'ambassador', 'admin'].map((role) => {
                  const hasRole = member.roles?.includes(role) || member.role === role;
                  return (
                    <div key={role} className="flex items-center justify-between p-4 rounded-xl border border-slate-800/50 bg-slate-800/20">
                      <div>
                        <div className="text-sm font-bold text-white capitalize">{role}</div>
                        <div className="text-xs text-slate-400">{hasRole ? 'Actif' : 'Inactif'}</div>
                      </div>
                      <div className="flex gap-2">
                        {!hasRole ? (
                          <button onClick={() => handleRolesUpdate(role, 'add')} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleRolesUpdate(role, 'remove')} className="p-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
`;

content = content.replace(
  /\{activeTab === 'permissions' && \(/,
  rolesUI + "\n          {activeTab === 'permissions' && ("
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
