const fs = require('fs');
const file = 'src/views/instructor/InstructorCoursePreview.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldStr = `      (error: any) => {
        console.error("Preview load error:", error.message);
        setError(true);
        setIsLoading(false);
      }
        } else {
          setError(true);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Erreur:", err);
        setError(true);
        setIsLoading(false);
      }
    );`;

const newStr = `      (error: any) => {
        console.error("Preview load error:", error.message);
        setError(true);
        setIsLoading(false);
      }
    );`;

content = content.replace(oldStr, newStr);
fs.writeFileSync(file, content);
console.log('Fixed syntax directly');
