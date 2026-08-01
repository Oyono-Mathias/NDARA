const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

// For License actions
content = content.replace(
  /<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Licences Formateur<\/h3>/,
  `<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Licences Formateur</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <ActionButton icon={Plus} label="Attribuer une licence" onClick={() => handleQuickAction('gift_license')} />
                <ActionButton icon={Minus} label="Retirer une licence" onClick={() => handleQuickAction('remove_license')} />
              </div>`
);
content = content.replace(
  /<button onClick=\{\(\) => handleLicenseMarketAction\('allow_resale', item\)\} className="px-3 py-1 bg-emerald-500\/20 text-emerald-400 text-xs rounded-lg">Autoriser revente<\/button>\s*<button onClick=\{\(\) => handleLicenseMarketAction\('block_resale', item\)\} className="px-3 py-1 bg-rose-500\/20 text-rose-400 text-xs rounded-lg">Bloquer revente<\/button>\s*<button onClick=\{\(\) => handleLicenseMarketAction\('force_transfer', item\)\} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">Transférer<\/button>/,
  `<button onClick={() => handleLicenseMarketAction('suspend', item)} className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-lg">Suspendre</button>
                      <button onClick={() => handleLicenseMarketAction('reactivate', item)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Réactiver</button>
                      <button onClick={() => handleLicenseMarketAction('renew', item)} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">Renouveler</button>
                      <button onClick={() => handleLicenseMarketAction('change_type', item)} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">Changer Type</button>`
);

// For Marketplace
content = content.replace(
  /<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Marketplace des Licences<\/h3>/,
  `<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Marketplace des Licences</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <ActionButton icon={ToggleRight} label="Autoriser revente globale" onClick={() => handleLicenseMarketAction('allow_resale_global')} />
                <ActionButton icon={Ban} label="Interdire revente globale" onClick={() => handleLicenseMarketAction('block_resale_global')} />
              </div>`
);

// And we need to add the force transfer button into the marketplace list
content = content.replace(
  /<button onClick=\{\(\) => handleLicenseMarketAction\('suspend_sales', item\)\} className="px-3 py-1 bg-rose-500\/20 text-rose-400 text-xs rounded-lg">Suspendre<\/button>/,
  `<button onClick={() => handleLicenseMarketAction('suspend_sales', item)} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs rounded-lg">Suspendre</button>
                      <button onClick={() => handleLicenseMarketAction('force_transfer', item)} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">Forcer Transfert</button>`
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
