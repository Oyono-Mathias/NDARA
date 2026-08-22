const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');
const lines = content.split('\n');
let inFunction = false;
let depth = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('app.post("/api/video/create"')) {
        inFunction = true;
    }
    if (inFunction) {
        console.log(lines[i]);
        const openMatches = (lines[i].match(/\{/g) || []).length;
        const closeMatches = (lines[i].match(/\}/g) || []).length;
        depth += (openMatches - closeMatches);
        if (depth === 0 && openMatches === 0 && closeMatches > 0) {
           break; // safety
        }
        if (depth === 0 && i > 0 && lines[i].includes('});')) {
            break;
        }
    }
}
