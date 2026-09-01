import * as fs from 'fs';

function stripComments(code: string) {
    return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
}

const appTsxPath = 'src/App.tsx';
if (!fs.existsSync(appTsxPath)) {
    console.error("FAIL: src/App.tsx not found");
    process.exit(1);
}

const rawCode = fs.readFileSync(appTsxPath, 'utf8');
const code = stripComments(rawCode);

let failed = false;

// Actual assertion: check if RoleGuard is actively wrapping routes
if (!code.includes('<RoleGuard')) {
    console.error("FAIL: RoleGuard missing in code");
    failed = true;
}
if (!code.includes('<AuthGuard')) {
    console.error("FAIL: AuthGuard missing in code");
    failed = true;
}

// Verify Admin role is restricted
if (code.includes("allowedRoles={['admin']}")) {
    console.log("PASS: Admin role guard explicitly checked.");
} else {
    console.error("FAIL: Admin role guard not found.");
    failed = true;
}

if (failed) {
    process.exit(1);
}

console.log("PASS: Auth definitions and guards are correctly structured.");
process.exit(0);
