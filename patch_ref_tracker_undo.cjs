const fs = require('fs');
let code = fs.readFileSync('src/components/ReferralTracker.tsx', 'utf8');

const targetRegex = /      if \(\!hasTracked\) \{\n\s*\(\w*async \(\) => \{[\s\S]*?console\.error\('Error tracking click locally:', err\);\n\s*\}\n\s*\}\)\(\);\n\s*sessionStorage\.setItem\(\`tracked_\$\{ref\}\`, 'true'\);\n\s*\}/;

const replacement = `      if (!hasTracked) {
        fetch('/api/ambassador/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refCode: ref,
            landingPage: window.location.pathname
          })
        }).catch(err => console.error('Error tracking click:', err));
        
        sessionStorage.setItem(\`tracked_\${ref}\`, 'true');
      }`;

code = code.replace(targetRegex, replacement);
fs.writeFileSync('src/components/ReferralTracker.tsx', code);
