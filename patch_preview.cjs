const fs = require('fs');
const file = 'src/views/instructor/InstructorCoursePreview.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`      (snap) => {
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data()       },
      (error) => {
        console.error("Preview load error:", error);
        setError(true);
        setIsLoading(false);
      }
    );
        } else {
          setError(true);
        }
        setIsLoading(false);
      },`,
`      (snap) => {
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() } as Course);
        } else {
          setError(true);
        }
        setIsLoading(false);
      },
      (error: any) => {
        console.error("Preview load error:", error.message);
        setError(true);
        setIsLoading(false);
      }`
);

fs.writeFileSync(file, content);
console.log('patched preview');
