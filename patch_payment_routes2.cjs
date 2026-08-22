const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'routes', 'paymentRoutes.ts');
let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `    // 2. If it's a License Purchase
    if (txData.type === 'license') {
        await purchaseBourseLicense(txData.userId, txData.licenseTier || 'STANDARD');`;

const newCode = `    // 2. If it's a License Purchase
    if (txData.type === 'license') {
        await purchaseBourseLicense(txData.userId, txData.amount, txData.licenseTier || 'STANDARD');`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Patched paymentRoutes.ts again successfully");
