const fs = require('fs');
const file = 'src/components/instructor/course-content/LessonEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /const \[documentUrl,\s*description,\s*duration: Number\(duration\) \|\| 0, setDocumentUrl\] = useState\(lesson\.documentUrl \|\| ''\);/g,
    "const [documentUrl, setDocumentUrl] = useState(lesson.documentUrl || '');"
);

fs.writeFileSync(file, code);
