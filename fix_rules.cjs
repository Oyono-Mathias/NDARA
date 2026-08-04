const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

// Replace the incorrect structure
code = code.replace(/    match \/short_links\/\{id\} \{\s+allow read: if true;\s+allow write: if isAuthenticated\(\) && \(resource\.data\.userId == request\.auth\.uid \|\| request\.resource\.data\.userId == request\.auth\.uid \|\| isAdmin\(\)\);\s+\}\s+\}\s+\}/g, 
`    match /short_links/{id} {
       allow read: if true;
       allow write: if isAuthenticated() && (resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid || isAdmin());
     }`);
     
// Then remove the trailing braces if any
code = code.replace(/  \}\n\}$/g, '');

code += "\n  }\n}\n";

fs.writeFileSync('firestore.rules', code);
