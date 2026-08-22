const fs = require('fs');
const file = fs.readFileSync('src/views/instructor/InstructorCourseCreate.tsx', 'utf8');
const match = file.match(/const publishCourse = async \(\) => \{[\s\S]*?catch \([^)]*\) \{/);
console.log(match ? match[0] : "Not found");
