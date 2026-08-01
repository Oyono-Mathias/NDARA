const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/adminDb\.collection\('audit_logs'\)\.add\(\{([\s\S]*?timestamp: new Date\(\)\s*)\}\);/g, `adminDb.collection('audit_logs').add({$1}).catch(e => console.warn('audit log failed', e.message));`);

fs.writeFileSync('server.ts', code, 'utf8');
