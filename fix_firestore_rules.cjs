const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace("  }\n}\n    // --- Phase 10 : Ambassadeurs (Gamification & Rewards) ---", "    // --- Phase 10 : Ambassadeurs (Gamification & Rewards) ---");

if (!rules.endsWith("  }\n}\n")) {
  if (rules.endsWith("  }\n}")) {
     // Do nothing
  } else if (rules.endsWith("  }\n")) {
      rules += "}\n";
  } else {
      rules += "\n  }\n}\n";
  }
}

fs.writeFileSync('firestore.rules', rules);
console.log("Fixed firestore.rules");
