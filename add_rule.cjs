const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'firestore.rules');
let code = fs.readFileSync(file, 'utf8');

const newRule = `
    match /live_sessions/{sessionId} {
      allow read: if isAuthenticated();
      allow write: if isInstructor() || isAdmin();
    }
`;

if (!code.includes('match /live_sessions')) {
    code = code.replace(
        'match /courses/{courseId} {',
        newRule + '\n    match /courses/{courseId} {'
    );
    fs.writeFileSync(file, code);
    console.log("Rule added");
} else {
    console.log("Rule already exists");
}
