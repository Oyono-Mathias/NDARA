const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');
const lines = code.split('\n');
lines.forEach((line, i) => {
    if (line.includes('export async function')) {
        console.log(`Line ${i+1}: ${line}`);
        console.log(`Line ${i+2}: ${lines[i+1]}`);
        console.log(`Line ${i+3}: ${lines[i+2]}`);
    }
});
