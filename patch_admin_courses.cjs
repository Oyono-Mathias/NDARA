const fs = require('fs');
const path = require('path');
const patchName = 'patch_admin_courses.cjs';
console.log(`[${patchName}] Initializing...`);
const isDryRun = process.env.DRY_RUN !== 'false';

const targetFile = path.join(process.cwd(), 'src/views/admin/catalogue/CoursesManager.tsx');

if (!fs.existsSync(targetFile)) {
    console.log(`[${patchName}] Target file src/views/admin/catalogue/CoursesManager.tsx not found. Skipping.`);
    process.exit(0);
}

const content = fs.readFileSync(targetFile, 'utf8');

if (content.includes('allowPublishWithoutReview: true')) {
    console.log(`[${patchName}] Vulnerability or legacy code detected: Unreviewed publish`);
    
    if (isDryRun) {
        console.log(`[${patchName}] DRY RUN — Would patch src/views/admin/catalogue/CoursesManager.tsx`);
    } else {
        const patchedContent = content.replace('allowPublishWithoutReview: true', 'allowPublishWithoutReview: false');
        fs.writeFileSync(targetFile + '.bak', content);
        fs.writeFileSync(targetFile, patchedContent);
        console.log(`[${patchName}] LIVE — Patched src/views/admin/catalogue/CoursesManager.tsx`);
    }
} else {
    console.log(`[${patchName}] Target signature not found. Idempotence achieved (already patched or not vulnerable).`);
}

process.exit(0);
