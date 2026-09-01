const fs = require('fs');
const path = require('path');

const patchName = 'patch_auth_middleware.js';
console.log(`[${patchName}] Initializing...`);
const isDryRun = process.env.DRY_RUN !== 'false';
console.log(`[${patchName}] Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);

const targetFile = path.join(process.cwd(), 'src/middlewares/authMiddleware.ts');

if (!fs.existsSync(targetFile)) {
    console.warn(`BLOCKED: Target file ${targetFile} not found.`);
    process.exit(2);
}

const content = fs.readFileSync(targetFile, 'utf8');

// Audit existing security posture
const hasRoleCheck = content.includes('req.user.role') || content.includes('role');
const hasAuthCheck = content.includes('req.user') || content.includes('auth');
const bypassDetect = content.match(/req\.query\.role/i) || content.match(/req\.headers\['x-role'\]/i);

console.log(`[${patchName}] Auditing authMiddleware.ts...`);
let isVulnerable = false;

if (!hasAuthCheck || !hasRoleCheck) {
    console.error(`FAIL: ${patchName} detected missing Role or Auth checks. This weakens security.`);
    process.exit(1);
}

if (bypassDetect) {
    console.warn(`[${patchName}] VULNERABILITY DETECTED: Role can be bypassed via client input.`);
    isVulnerable = true;
}

if (!isVulnerable) {
    console.log(`[${patchName}] No vulnerabilities detected. Idempotence: Patch already applied or unnecessary.`);
    if (isDryRun) {
        console.log(`[${patchName}] DRY RUN — NO DATA MODIFIED`);
    }
    process.exit(0);
}

// Prepare patch
const patchedContent = content
    .replace(/req\.query\.role/gi, '/* BLOCKED BY PATCH */ null')
    .replace(/req\.headers\['x-role'\]/gi, '/* BLOCKED BY PATCH */ null');

if (patchedContent === content) {
    console.log(`[${patchName}] Patch logic could not safely transform the file. Manual review required.`);
    process.exit(1);
}

if (isDryRun) {
    console.log(`[${patchName}] DRY RUN — Target file would be patched to remove client-side role inputs.`);
    process.exit(0);
} else {
    // Create backup
    const backupFile = `${targetFile}.backup-${Date.now()}`;
    fs.writeFileSync(backupFile, content);
    console.log(`[${patchName}] Backup created at ${backupFile}`);
    
    // Write patch
    fs.writeFileSync(targetFile, patchedContent);
    console.log(`[${patchName}] Patch successfully applied to ${targetFile}.`);
    process.exit(0);
}
