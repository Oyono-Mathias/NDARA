const fs = require('fs');
const path = require('path');
const patchName = 'patch-claim-cert.cjs';
console.log(`[${patchName}] Initializing...`);
const isDryRun = process.env.DRY_RUN !== 'false';

const targetFile = path.join(process.cwd(), 'src/views/Certificates.tsx');

if (!fs.existsSync(targetFile)) {
    console.log(`[${patchName}] Target file src/views/Certificates.tsx not found. Skipping.`);
    process.exit(0);
}

const content = fs.readFileSync(targetFile, 'utf8');

if (content.includes('autoClaim: true')) {
    console.log(`[${patchName}] Vulnerability or legacy code detected: Auto claim certificates`);
    
    if (isDryRun) {
        console.log(`[${patchName}] DRY RUN — Would patch src/views/Certificates.tsx`);
    } else {
        const patchedContent = content.replace('autoClaim: true', 'autoClaim: false /* PATCHED: No automatic claims */');
        fs.writeFileSync(targetFile + '.bak', content);
        fs.writeFileSync(targetFile, patchedContent);
        console.log(`[${patchName}] LIVE — Patched src/views/Certificates.tsx`);
    }
} else {
    console.log(`[${patchName}] Target signature not found. Idempotence achieved (already patched or not vulnerable).`);
}

process.exit(0);
