const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

// Fix add_credit
content = content.replace(/await addDoc\(collection\(db, 'transactions'\), \{([\s\S]*?)createdAt: new Date\(\)\s*\}\);/g, (match, inner) => {
  if (inner.includes("'deposit'")) {
    return match + `\n        await updateDoc(doc(db, 'users', memberId), { walletBalance: (member.walletBalance || 0) + Number(data.amount) });`;
  } else if (inner.includes("'withdrawal'")) {
    return match + `\n        await updateDoc(doc(db, 'users', memberId), { walletBalance: (member.walletBalance || 0) - Number(data.amount) });`;
  }
  return match;
});

// Also let's add UI buttons for these actions inside the wallet tab.
const walletUIButtons = `
              <div className="flex flex-wrap gap-2 mb-4">
                <ActionButton icon={Plus} label="Ajouter du crédit" onClick={() => handleQuickAction('add_credit')} />
                <ActionButton icon={Minus} label="Retirer du crédit" onClick={() => handleQuickAction('remove_credit')} />
                <ActionButton icon={Edit3} label="Corriger le solde" onClick={() => handleQuickAction('correct_balance')} />
                <ActionButton icon={Lock} label="Geler un montant" onClick={() => handleQuickAction('freeze_amount')} />
                <ActionButton icon={Unlock} label="Dégeler un montant" onClick={() => handleQuickAction('unfreeze_amount')} />
                <ActionButton icon={CreditCard} label="Tx manuelle" onClick={() => handleQuickAction('manual_tx')} />
              </div>
`;

content = content.replace(/<div className="space-y-6">\s*<div>\s*<h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Portefeuille & Transactions<\/h3>/, 
  `<div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-4">Portefeuille & Transactions</h3>` + walletUIButtons);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
