const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

content = content.replace(/handleQuickAction\('correct_balance'\)/g, "handleQuickAction('correct')");
content = content.replace(/handleQuickAction\('freeze_amount'\)/g, "handleQuickAction('freeze_wallet')");

// We don't have unfreeze_amount without item, but we'll deal with unfreeze later or maybe prompt for ID? 
// No, the UI for unfreeze probably needs to be per item. Let's remove the global unfreeze button.
content = content.replace(/<ActionButton icon=\{Unlock\} label="Dégeler un montant" onClick=\{[^}]+\} \/>\n/g, "");

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
