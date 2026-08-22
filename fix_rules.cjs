const fs = require('fs');
const file = 'firestore.rules';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('function getCourseInstructor')) {
  code = code.replace(
    /function isOwner\(instructorId\) \{/,
    `function getCourseInstructor(courseId) {
      let course = get(/databases/$(database)/documents/courses/$(courseId));
      return course != null ? course.data.instructorId : null;
    }
    function isOwner(instructorId) {`
  );

  code = code.replace(
    /isOwner\(get\(\/databases\/\$\(database\)\/documents\/courses\/\$\(request\.resource\.data\.courseId\)\)\.data\.instructorId\)/g,
    'isOwner(getCourseInstructor(request.resource.data.courseId))'
  );
  
  code = code.replace(
    /isOwner\(get\(\/databases\/\$\(database\)\/documents\/courses\/\$\(resource\.data\.courseId\)\)\.data\.instructorId\)/g,
    'isOwner(getCourseInstructor(resource.data.courseId))'
  );

  fs.writeFileSync(file, code);
}
