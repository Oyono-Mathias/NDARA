const fs = require('fs');
let code = fs.readFileSync('src/routes/gamificationRoutes.ts', 'utf8');

if (!code.includes('import admin')) {
  code = code.replace(/import \{ adminDb \} from "\.\.\/lib\/firebaseAdmin\.js";/, 'import { adminDb, admin } from "../lib/firebaseAdmin.js";');
}

code = code.replace(/adminDb\.firestore\.FieldPath/g, 'admin.firestore.FieldPath');

fs.writeFileSync('src/routes/gamificationRoutes.ts', code);
