import * as fs from 'fs';
import * as path from 'path';

function stripComments(code: string) {
    return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
}

let vulnerabilities = 0;
function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', 'dist', '.git'].includes(file)) scanDir(fullPath);
        } else if (fullPath.match(/\.(ts|tsx|js|cjs)$/)) {
            if (fullPath.includes('security_test.ts') || fullPath.includes('audit_')) continue;
            const code = stripComments(fs.readFileSync(fullPath, 'utf8'));
            
            if (code.match(/localStorage\.setItem\(\s*['"]pin['"]/i)) {
                console.error(`FAIL: PIN stored in localStorage in ${fullPath}`);
                vulnerabilities++;
            }
            if (code.match(/-----BEGIN PRIVATE KEY-----/)) {
                console.error(`FAIL: Private key hardcoded in ${fullPath}`);
                vulnerabilities++;
            }
            if (code.match(/localStorage\.setItem\(\s*['"]role['"]/i)) {
                console.error(`FAIL: Role manipulated via localStorage in ${fullPath}`);
                vulnerabilities++;
            }
        }
    }
}
scanDir('src');
if (fs.existsSync('server.ts') && fs.statSync('server.ts').isFile()) {
    const code = stripComments(fs.readFileSync('server.ts', 'utf8'));
    if (code.match(/localStorage\.setItem\(\s*['"]pin['"]/i)) {
        console.error(`FAIL: PIN stored in localStorage in server.ts`);
        vulnerabilities++;
    }
    if (code.match(/-----BEGIN PRIVATE KEY-----/)) {
        console.error(`FAIL: Private key hardcoded in server.ts`);
        vulnerabilities++;
    }
}

if (vulnerabilities > 0) {
    console.error(`FAIL: ${vulnerabilities} vulnerabilities found.`);
    process.exit(1);
}
console.log("PASS: No hardcoded secrets or dangerous localStorage mutations detected.");
process.exit(0);
