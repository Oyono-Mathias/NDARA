const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'instructor', 'InstructorCourseCreate.tsx');

let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { auth } from \"../../firebase\";")) {
    code = code.replace(
        "import { db } from \"../../firebase\";",
        "import { db, auth } from \"../../firebase\";"
    );
}

const targetStr = `      const res = await fetch('/api/admin/video/drive-to-bunny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, accessToken, fileName, courseId: "new" })
      });`;

if (code.includes(targetStr)) {
    code = code.replace(
        targetStr,
        `      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/video/drive-to-bunny', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({ fileId, driveToken: accessToken, fileName, courseId: "new" })
      });`
    );
}

fs.writeFileSync(file, code);
console.log("Fixed create auth");
