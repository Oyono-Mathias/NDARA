const fs = require('fs');
const file = 'src/views/instructor/InstructorCourseFinalisation.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/navigate\(\`\/instructor\/courses\/\$\{courseId\}\/program\`\)/g, "navigate(`/instructor/courses/edit/${courseId}/program`)");
content = content.replace(/navigate\(\`\/instructor\/courses\/\$\{courseId\}\/media\`\)/g, "navigate(`/instructor/courses/edit/${courseId}/media`)");
content = content.replace(/navigate\(\`\/instructor\/courses\/\$\{courseId\}\/parametres\`\)/g, "navigate(`/instructor/courses/edit/${courseId}/parametres`)");

fs.writeFileSync(file, content);
console.log('Fixed finalisation routes');
