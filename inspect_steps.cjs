const fs = require('fs');
const file = fs.readFileSync('src/views/instructor/InstructorCourseCreate.tsx', 'utf8');
const match = file.match(/const STEPS = \[[\s\S]*?\];/);
console.log(match ? match[0] : "Not found");
