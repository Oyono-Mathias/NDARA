const fs = require('fs');
let file = fs.readFileSync('src/views/instructor/InstructorCourses.tsx', 'utf8');

file = file.replace(/const isDraft = course\.status === "Draft";/g, "const isDraft = course.status === 'draft';");
file = file.replace(/\{course\.status \|\| "Draft"\}/g, "{course.status === 'pending_review' ? 'En révision' : course.status === 'draft' ? 'Brouillon' : course.status === 'published' ? 'Publié' : course.status === 'rejected' ? 'Rejeté' : course.status || 'Brouillon'}");

fs.writeFileSync('src/views/instructor/InstructorCourses.tsx', file);
