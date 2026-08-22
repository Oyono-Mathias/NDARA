const fs = require('fs');
const file = 'src/views/instructor/InstructorLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = '].some(path => location.pathname.includes(path));';
const replacement = `].some(path => location.pathname.includes(path));

  const isWorkflowView = [
    "/courses/create",
    "/courses/edit",
    "/program",
    "/medias",
    "/parametres",
    "/finalisation"
  ].some(path => location.pathname.includes(path));`;

if (content.includes(anchor) && !content.includes('const isWorkflowView')) {
    content = content.replace(anchor, replacement);
    fs.writeFileSync(file, content);
    console.log('isWorkflowView added.');
} else {
    console.log('Already added or anchor not found.');
}
