const fs = require('fs');
const path = require('path');
const patchName = 'patch.js';
console.log(`[${patchName}] Initializing...`);
const isDryRun = process.env.DRY_RUN !== 'false';

const targetFile = path.join(process.cwd(), 'src/App.tsx');

if (!fs.existsSync(targetFile)) {
    console.log(`[${patchName}] Target file src/App.tsx not found. Skipping.`);
    process.exit(0);
}

const content = fs.readFileSync(targetFile, 'utf8');

if (content.includes('import LegacyRoute')) {
    console.log(`[${patchName}] Vulnerability or legacy code detected: Legacy import`);
    
    if (isDryRun) {
        console.log(`[${patchName}] DRY RUN — Would patch src/App.tsx`);
    } else {
        const patchedContent = content.replace('import LegacyRoute', '// import LegacyRoute');
        fs.writeFileSync(targetFile + '.bak', content);
        fs.writeFileSync(targetFile, patchedContent);
        console.log(`[${patchName}] LIVE — Patched src/App.tsx`);
    }
} else {
    console.log(`[${patchName}] Target signature not found. Idempotence achieved (already patched or not vulnerable).`);
}

process.exit(0);
