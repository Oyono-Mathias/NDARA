const fs = require('fs');
const file = 'src/views/CourseDetail.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const unsub = onSnapshot\(courseRef, async \(docSnap\) => \{([\s\S]*?)\}\);/m,
  `const unsub = onSnapshot(courseRef, async (docSnap) => {
$1
        }, (error) => {
            console.error("Course load error:", error);
            setCourse(null);
            setLoading(false);
        });`
);

fs.writeFileSync(file, code);
