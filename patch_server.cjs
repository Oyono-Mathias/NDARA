const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import googleApiRoutes from './google-api.js';")) {
  code = code.replace(
    'app.use(express.json({ limit: "5mb" }));',
    `app.use(express.json({ limit: "5mb" }));\n\n  const { default: googleApiRoutes } = await import('./google-api.js');\n  app.use('/api/google', googleApiRoutes);`
  );
  fs.writeFileSync('server.ts', code);
}
