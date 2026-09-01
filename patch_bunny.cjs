const fs = require('fs');
const path = require('path');
const patchName = 'patch_bunny.cjs';
console.log(`[${patchName}] Initializing...`);
const isDryRun = process.env.DRY_RUN !== 'false';

const targetFile = path.join(process.cwd(), 'src/middlewares/uploadMiddleware.ts');

if (!fs.existsSync(targetFile)) {
    console.log(`[${patchName}] Target file src/middlewares/uploadMiddleware.ts not found. Skipping.`);
    process.exit(0);
}

const content = fs.readFileSync(targetFile, 'utf8');

if (content.includes('BUNNY_CDN_KEY')) {
    console.log(`[${patchName}] Vulnerability or legacy code detected: Hardcoded CDN key`);
    
    if (isDryRun) {
        console.log(`[${patchName}] DRY RUN — Would patch src/middlewares/uploadMiddleware.ts`);
    } else {
        const patchedContent = content.replace('BUNNY_CDN_KEY', 'process.env.BUNNY_CDN_KEY');
        fs.writeFileSync(targetFile + '.bak', content);
        fs.writeFileSync(targetFile, patchedContent);
        console.log(`[${patchName}] LIVE — Patched src/middlewares/uploadMiddleware.ts`);
    }
} else {
    console.log(`[${patchName}] Target signature not found. Idempotence achieved (already patched or not vulnerable).`);
}

process.exit(0);
