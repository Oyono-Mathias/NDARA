const fs = require('fs');
const file = 'src/views/instructor/InstructorCoursePreview.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `  useEffect(() => {
    if (!courseId) return;

    const unsubscribe = onSnapshot(
      doc(db, "courses", courseId),
      (snap) => {
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() } as Course);
        } else {
          setError(true);
        }
        setIsLoading(false);
      },
      (error: any) => {
        console.error("Preview load error:", error.message || error);
        setError(true);
        setIsLoading(false);
      }
    );`;

const regex = /  useEffect\(\(\) => \{\s*if \(\!courseId\) return;\s*const unsubscribe = onSnapshot\([\s\S]*? \}\s*\);/m;
content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Fixed syntax in preview');
