const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    'const { MarketingRoutes } = require("./src/lib/marketingBackend.js");',
    'const { MarketingRoutes } = await import("./src/lib/marketingBackend.js");'
);
fs.writeFileSync(file, code);
