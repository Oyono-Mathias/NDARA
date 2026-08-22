const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseEdit.tsx', 'utf8');

code = code.replace(/<ContentManager courseId={courseId} \/>/g, '<ContentManager courseId={courseId!} />');

fs.writeFileSync('src/views/instructor/InstructorCourseEdit.tsx', code);
