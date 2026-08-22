const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorLayout.tsx', 'utf8');

if (!code.includes('InstructorCourseProgram')) {
    code = code.replace(
        'import { InstructorCourseEdit } from "./InstructorCourseEdit";',
        'import { InstructorCourseEdit } from "./InstructorCourseEdit";\nimport { InstructorCourseProgram } from "./InstructorCourseProgram";'
    );
    
    code = code.replace(
        '<Route\n                  path="courses/edit/:id"\n                  element={<InstructorCourseEdit />}\n                />',
        '<Route\n                  path="courses/edit/:id"\n                  element={<InstructorCourseEdit />}\n                />\n                <Route\n                  path="courses/:id/program"\n                  element={<InstructorCourseProgram />}\n                />'
    );
    
    fs.writeFileSync('src/views/instructor/InstructorLayout.tsx', code);
}
