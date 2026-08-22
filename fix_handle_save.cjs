const fs = require('fs');
const file = 'src/components/instructor/course-content/LessonEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /documentUrl,\s*isFreePreview/g,
    "documentUrl,\n        description,\n        duration: Number(duration) || 0,\n        isFreePreview"
);

fs.writeFileSync(file, code);
