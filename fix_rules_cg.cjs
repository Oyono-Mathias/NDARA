const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

if (!code.includes('match /{path=**}/assignments/{id}')) {
  code = code.replace(
    /match \/courses\/{courseId}\/assignments\/{assignmentId} \{ allow read, write: if isAuthenticated\(\); \}/,
    'match /courses/{courseId}/assignments/{assignmentId} { allow read, write: if isAuthenticated(); }\n    match /{path=**}/assignments/{id} { allow read, write: if isAuthenticated(); }'
  );
  fs.writeFileSync('firestore.rules', code);
}
