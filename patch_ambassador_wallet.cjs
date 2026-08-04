const fs = require('fs');
let code = fs.readFileSync('src/views/ambassador/AmbassadorWallet.tsx', 'utf8');

code = code.replace(
  "const res = await fetch('/api/wallet/ambassador-withdraw', {",
  "const res = await fetch('/api/withdrawals/request', {"
);

code = code.replace(
  "body: JSON.stringify({ amount: Number(withdrawAmount), method: paymentMethod, details: paymentDetails })",
  "body: JSON.stringify({ amount: Number(withdrawAmount), paymentMethod: paymentMethod, paymentAccount: paymentDetails })"
);

// We need to fetch from withdraw_requests to show in the list? Or from wallet_history?
// The prompt says: "Créer une page complète : Historique des retraits avec Montant, Date, Statut, Référence, Méthode"
// Let's modify the transactions list to load withdraw_requests.
