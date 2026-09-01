const fs = require('fs');
const path = require('path');
const patchName = 'patch_courseId.cjs';
console.log(`[${patchName}] Initializing...`);
const isDryRun = process.env.DRY_RUN !== 'false';

const targetFile = path.join(process.cwd(), 'src/views/instructor/InstructorCourseCreate.tsx');

if (!fs.existsSync(targetFile)) {
    console.log(`[${patchName}] Target file src/views/instructor/InstructorCourseCreate.tsx not found. Skipping.`);
    process.exit(0);
}

const content = fs.readFileSync(targetFile, 'utf8');

if (content.includes('courseId = Math.random()')) {
    console.log(`[${patchName}] Vulnerability or legacy code detected: Weak course ID`);
    
    if (isDryRun) {
        console.log(`[${patchName}] DRY RUN — Would patch src/views/instructor/InstructorCourseCreate.tsx`);
    } else {
        const patchedContent = content.replace('courseId = Math.random()', 'courseId = generateSecureId()');
        fs.writeFileSync(targetFile + '.bak', content);
        fs.writeFileSync(targetFile, patchedContent);
        console.log(`[${patchName}] LIVE — Patched src/views/instructor/InstructorCourseCreate.tsx`);
    }
} else {
    console.log(`[${patchName}] Target signature not found. Idempotence achieved (already patched or not vulnerable).`);
}

process.exit(0);
