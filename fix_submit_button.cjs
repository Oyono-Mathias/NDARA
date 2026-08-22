const fs = require('fs');
const file = 'src/views/instructor/InstructorCourseEdit.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "{isDraft && !isRequestedBuyout && (",
  "{(isDraft || course.status === 'rejected') && !isRequestedBuyout && ("
);

fs.writeFileSync(file, code);
