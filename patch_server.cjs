const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "import paymentRoutes from './src/routes/paymentRoutes.js';",
  "import paymentRoutes from './src/routes/paymentRoutes.js';\nimport withdrawalRoutes from './src/routes/withdrawalRoutes.js';"
);

code = code.replace(
  "app.use('/api/payments', paymentRoutes);",
  "app.use('/api/payments', paymentRoutes);\n  app.use('/api/withdrawals', withdrawalRoutes);"
);

fs.writeFileSync('server.ts', code);
