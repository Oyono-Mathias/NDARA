const fs = require('fs');
const file = 'src/views/instructor/InstructorCourseEdit.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "{isPublished\n                  ? \"Publié\"\n                  : isPending\n                    ? \"En attente de validation\"\n                    : \"Brouillon\"}",
  "{isPublished\n                  ? \"Publié\"\n                  : isPending\n                    ? \"En attente\"\n                    : course.status === 'rejected' ? \"Rejeté\" : \"Brouillon\"}"
);

fs.writeFileSync(file, code);
