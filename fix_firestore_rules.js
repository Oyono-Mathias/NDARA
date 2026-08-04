const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// Find the position of the last two closing braces
const match = rules.match(/  \}\n\}\n    \/\/ --- Phase 10/);
if (match) {
    rules = rules.replace(/  \}\n\}\n    \/\/ --- Phase 10/, '    // --- Phase 10');
    rules += '\n  }\n}\n';
    fs.writeFileSync('firestore.rules', rules);
    console.log("Fixed firestore.rules");
} else {
    console.log("Could not find the exact pattern.");
}
