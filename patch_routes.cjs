const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('<Route path="google-test"')) {
  code = code.replace(
    '<Route path="/student/courses/:slug" element={<CoursePlayer />} />',
    '<Route path="/student/courses/:slug" element={<CoursePlayer />} />\n        <Route path="/google-test" element={<GoogleWorkspaceTest />} />'
  );
  fs.writeFileSync('src/App.tsx', code);
}
