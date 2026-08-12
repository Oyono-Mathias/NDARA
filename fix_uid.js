import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /const amount = data\.commission;/;
const replacement = `const amount = data.commission;\n            const uid = data.referredUserId || data.studentId || '';`;

content = content.replace(regex, replacement);
fs.writeFileSync('server.ts', content);
console.log("Fixed uid in server.ts!");
