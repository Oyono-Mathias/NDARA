import fs from 'fs';

let content = fs.readFileSync('src/middlewares/authMiddleware.ts', 'utf8');
const target = `import { admin } from "../lib/firebaseAdmin.js";`;
const replacement = `import { admin, adminDb } from "../lib/firebaseAdmin.js";`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/middlewares/authMiddleware.ts', content);
    console.log("Patched imports in authMiddleware.ts");
}
