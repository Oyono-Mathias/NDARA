const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/CourseForm.tsx', 'utf8');

// There is an extra </div> or a missing opening tag.
// The regex `code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">[\s\S]*?<\/div>\s*<\/div>/, '      </div>');` probably removed too much or too little.
