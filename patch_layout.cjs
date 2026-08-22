const fs = require('fs');
const file = 'src/views/instructor/InstructorLayout.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    '                <Route\n                  path="courses/preview/:id"',
    '                <Route\n                  path="courses/:id/finalisation"\n                  element={<InstructorCourseFinalisation />}\n                />\n                <Route\n                  path="courses/preview/:id"'
);
fs.writeFileSync(file, content);
console.log('patched route');
