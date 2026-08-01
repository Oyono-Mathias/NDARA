const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'instructor', 'course-content', 'ContentManager.tsx');

let code = fs.readFileSync(file, 'utf8');

const targetStr = `      const res = await fetch('/api/admin/video/drive-to-bunny', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ fileId, accessToken, fileName })
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
         body: JSON.stringify({ fileId, driveToken: accessToken, fileName, courseId: courseId || "new", lesId })
       });`
    );
}

// Fix picker origin here too
code = code.replace(
`        const pickerOrigin = window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
           ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
           : window.location.origin;`,
`        const pickerOrigin = window.location.protocol + '//' + window.location.host;`
);

fs.writeFileSync(file, code);
console.log("Fixed content auth and origin");
