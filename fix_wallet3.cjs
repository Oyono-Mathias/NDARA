const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

content = content.replace(
  /onClick=\{\(\) => handleQuickAction\('correct'\)\}/g,
  "onClick={() => handleWalletTabAction('correct')}"
);
content = content.replace(
  /onClick=\{\(\) => handleQuickAction\('freeze_wallet'\)\}/g,
  "onClick={() => handleWalletTabAction('freeze')}"
);
content = content.replace(
  /onClick=\{\(\) => handleQuickAction\('manual_tx'\)\}/g,
  "onClick={() => handleWalletTabAction('manual_tx')}"
);

// We need an unfreeze button per item in extraData (wallet_holds)
// And cancel_tx per item in tabData (transactions)

// Let's add Cancel button to transactions list
content = content.replace(
  /<span className="text-sm font-black text-white">\{item\.amount\} \{item\.currency\}<\/span>\s*<\/div>/g,
  `<span className="text-sm font-black text-white">{item.amount} {item.currency}</span>
                        {item.status !== 'cancelled' && (
                          <button onClick={() => handleWalletTabAction('cancel_tx', item)} className="ml-4 p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>`
);

// Let's add unfreeze button to wallet_holds (extraData in wallet tab)
content = content.replace(
  /<span className="text-sm font-black text-white">\{item\.amount\} FCFA<\/span>\s*<\/div>/g,
  `<span className="text-sm font-black text-white">{item.amount} FCFA</span>
                        {item.status === 'frozen' && (
                          <button onClick={() => handleWalletTabAction('unfreeze', item)} className="ml-4 p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg">
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                      </div>`
);


fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
