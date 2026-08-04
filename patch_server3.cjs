const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import withdrawalRoutes from")) {
    code = code.replace(
        'import paymentRoutes from "./src/routes/paymentRoutes.js";',
        'import paymentRoutes from "./src/routes/paymentRoutes.js";\nimport withdrawalRoutes from "./src/routes/withdrawalRoutes.js";'
    );
    fs.writeFileSync('server.ts', code);
}
