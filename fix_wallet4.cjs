const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

content = content.replace(
  /unsubExtra = onSnapshot\(query\(collection\(db, 'refund_requests'\), where\('userId', '==', member\.id\), orderBy\('createdAt', 'desc'\)\),/g,
  "unsubExtra = onSnapshot(query(collection(db, 'wallet_holds'), where('userId', '==', member.id), orderBy('createdAt', 'desc')),"
);

content = content.replace(
  /<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Historique des remboursements<\/h3>/,
  '<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Fonds Bloqués</h3>'
);

content = content.replace(
  /<EmptyState icon=\{RefreshCw\} title="Aucun remboursement" \/>/g,
  '<EmptyState icon={Lock} title="Aucun fond bloqué" />'
);

content = content.replace(
  /<span className="text-sm font-bold text-white">\{item\.courseTitle \|\| 'Remboursement'\}<\/span>/g,
  '<span className="text-sm font-bold text-white">{item.reason || \'Gel\'}</span>'
);

content = content.replace(
  /<p className="text-xs text-slate-400">Montant: \{item\.amount\} \/ Statut: <span className=\{clsx\(/g,
  '<p className="text-xs text-slate-400">Montant: {item.amount} / Statut: <span className={clsx('
);

content = content.replace(
  /item\.status === 'approved' \? "text-emerald-500" :/g,
  'item.status === \'released\' ? "text-emerald-500" :'
);
content = content.replace(
  /item\.status === 'pending' \? "text-orange-500" :/g,
  'item.status === \'frozen\' ? "text-orange-500" :'
);
content = content.replace(
  /\{item\.status === 'pending' && \(/g,
  '{item.status === \'frozen\' && ('
);
content = content.replace(
  /<button onClick=\{\(\) => handleRefundAction\(item\.id as string, 'approved'\)\} className="px-3 py-1 bg-emerald-500\/20 text-emerald-400 text-xs rounded-lg">Accepter<\/button>\s*<button onClick=\{\(\) => handleRefundAction\(item\.id as string, 'rejected'\)\} className="px-3 py-1 bg-rose-500\/20 text-rose-400 text-xs rounded-lg">Refuser<\/button>/g,
  '<button onClick={() => handleWalletTabAction(\'unfreeze\', item)} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg">Dégeler</button>'
);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
