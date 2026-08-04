const fs = require('fs');
let code = fs.readFileSync('src/routes/gamificationRoutes.ts', 'utf8');

code = code.replace(
    ".where('status', 'in', ['pending', 'validated', 'paid'])",
    "// status filter moved to memory to avoid composite index requirements"
);

// We need to add the memory filter. 
// Finding: txSnap.forEach(d => { const tx = d.data();
const target = "txSnap.forEach(d => {";
const replacement = `txSnap.forEach(d => {
        const tx = d.data();
        if (!['pending', 'validated', 'paid'].includes(tx.status)) return;`;
code = code.replace(target, replacement);

fs.writeFileSync('src/routes/gamificationRoutes.ts', code);
