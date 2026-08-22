const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/CourseForm.tsx', 'utf8');

code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<button/, '        </div>\n      </div>\n\n      <button');
fs.writeFileSync('src/components/instructor/CourseForm.tsx', code);
