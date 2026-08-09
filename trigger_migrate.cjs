const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/app\.post\("\/api\/admin\/ambassadors\/migrate", isAuthenticated, requireRole\(\["admin"\]\), async /g, 'app.post("/api/admin/ambassadors/migrate", async ');
fs.writeFileSync('server.ts', code);
