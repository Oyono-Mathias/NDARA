const fs = require('fs');
const file = 'src/views/instructor/InstructorLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<Route
                  path="courses/:id/program"
                  element={<InstructorCourseProgram />}
                />`;
const replacement = `<Route
                  path="courses/:id/program"
                  element={<InstructorCourseProgram />}
                />
                <Route
                  path="courses/:id/medias"
                  element={<InstructorCourseMedias />}
                />`;

if (content.includes(target) && !content.includes('courses/:id/medias')) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Route added.');
} else {
    console.log('Route already exists or target not found.');
}
