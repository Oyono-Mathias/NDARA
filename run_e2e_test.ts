import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
if (!deps['cypress'] && !deps['@playwright/test']) {
    console.warn("BLOCKED: No E2E framework (Cypress or Playwright) detected in package.json.");
    process.exit(2);
}
console.log("PASS: E2E framework available.");
process.exit(0);
