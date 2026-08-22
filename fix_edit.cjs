const fs = require('fs');
const file = 'src/views/instructor/InstructorCourseEdit.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const unsub = onSnapshot\(doc\(db, "courses", id\), \(docSnap\) => \{([\s\S]*?)\}\);/m,
  `const unsub = onSnapshot(doc(db, "courses", id), (docSnap) => {
$1
    }, (error) => {
        console.error("Edit load error:", error);
    });`
);

fs.writeFileSync(file, code);
