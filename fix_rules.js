const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

// The code currently has:
//   }
// }
//     // --- Phase 10 : Ambassadeurs (Gamification & Rewards) ---

code = code.replace("  }\n}\n    // --- Phase 10 : Ambassadeurs (Gamification & Rewards) ---", "    // --- Phase 10 : Ambassadeurs (Gamification & Rewards) ---");

// Check if it's there
let lastBracketPos = code.lastIndexOf('}');
if (lastBracketPos !== -1) {
    code = code.substring(0, lastBracketPos) + code.substring(lastBracketPos + 1);
}
lastBracketPos = code.lastIndexOf('}');
if (lastBracketPos !== -1) {
    code = code.substring(0, lastBracketPos) + code.substring(lastBracketPos + 1);
}

code += "\n  }\n}\n";

fs.writeFileSync('firestore.rules', code);
