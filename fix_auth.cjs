const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/const { adminDb, adminAuth, admin }/g, "const { adminDb, admin } =");
code = code.replace(/authUser = await adminAuth.getUser\(uid\);/g, "authUser = await admin.auth().getUser(uid);");
fs.writeFileSync('server.ts', code);

let code2 = fs.readFileSync('run_migration_local.ts', 'utf8');
code2 = code2.replace(/import { adminDb, adminAuth, admin }/g, 'import { adminDb, admin }');
code2 = code2.replace(/authUser = await adminAuth.getUser\(uid\);/g, "authUser = await admin.auth().getUser(uid);");
fs.writeFileSync('run_migration_local.ts', code2);
