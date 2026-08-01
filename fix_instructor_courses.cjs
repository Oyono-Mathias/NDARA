const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourses.tsx', 'utf8');

code = code.replace(`    if (
      (await confirm(
        "Supprimer cette formation ? Cette action est irréversible.",
      )))
    ) {`, `    if (await confirm("Supprimer cette formation ? Cette action est irréversible.")) {`);

fs.writeFileSync('src/views/instructor/InstructorCourses.tsx', code, 'utf8');
