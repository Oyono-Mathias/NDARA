const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("withdrawalRoutes")) {
    const importPayment = "import paymentRoutes from './src/routes/paymentRoutes.js';";
    if (code.includes(importPayment)) {
        code = code.replace(importPayment, importPayment + "\nimport withdrawalRoutes from './src/routes/withdrawalRoutes.js';");
    }

    const usePayment = 'app.use("/api/payment", paymentRoutes);';
    if (code.includes(usePayment)) {
        code = code.replace(usePayment, usePayment + '\n  app.use("/api/withdrawals", withdrawalRoutes);');
    }
    fs.writeFileSync('server.ts', code);
}
