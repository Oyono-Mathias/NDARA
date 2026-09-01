import fs from 'fs';
const serverCode = fs.existsSync('server.ts') ? fs.readFileSync('server.ts', 'utf8') : '';
if (!serverCode.includes('/api/payment') && !serverCode.includes('/api/checkout') && !serverCode.includes('/api/wallet')) {
    console.warn("BLOCKED: No backend payment routes implemented natively in server.ts to test.");
    process.exit(2);
}
console.error("FAIL: Unexpected payment routes detected in mock server without proper isolation.");
process.exit(1);
