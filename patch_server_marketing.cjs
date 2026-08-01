const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

const imports = `import { MarketingRoutes } from "./src/lib/marketingBackend.js";\n`;

const endpoints = `
  app.post("/api/marketing/click", MarketingRoutes.trackClick);
  app.post("/api/marketing/conversion", MarketingRoutes.trackConversion);
  app.get("/api/marketing/download", MarketingRoutes.downloadAsset);
`;

if (!code.includes('/api/marketing/click')) {
    code = code.replace(
        'import { createServer as createViteServer } from "vite";',
        'import { createServer as createViteServer } from "vite";\n' + imports
    );
    
    code = code.replace(
        '  app.use(\'/uploads\', express.static(path.join(process.cwd(), \'uploads\')));',
        endpoints + '\n  app.use(\'/uploads\', express.static(path.join(process.cwd(), \'uploads\')));'
    );
    
    fs.writeFileSync(file, code);
}
