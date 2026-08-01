const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'instructor', 'InstructorLayout.tsx');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('InstructorLiveSessions')) {
    code = code.replace(
        "import { InstructorAvis } from './InstructorAvis';",
        "import { InstructorAvis } from './InstructorAvis';\nimport { InstructorLiveSessions } from './InstructorLiveSessions';"
    );
    code = code.replace(
        '<Route path="courses" element={<InstructorCourses />} />',
        '<Route path="courses" element={<InstructorCourses />} />\n                <Route path="live" element={<InstructorLiveSessions />} />'
    );
    fs.writeFileSync(file, code);
    console.log("Layout updated");
} else {
    console.log("Already updated");
}
