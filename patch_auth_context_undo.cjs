const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const targetRegex = /\/\/ Track login & auto-create ambassador locally[\s\S]*?console\.error\("Failed to track login locally", err\);\n\s*\}/;

const replacement = `      // Track login & auto-create ambassador
      try {
        const token = await user.getIdToken();
        await fetch('/api/user/track', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${token}\`
          }
        });
      } catch (err) {
        console.error("Failed to track login", err);
      }`;

code = code.replace(targetRegex, replacement);
fs.writeFileSync('src/contexts/AuthContext.tsx', code);
