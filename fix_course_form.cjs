const fs = require('fs');
const file = 'src/components/instructor/CourseForm.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "className=\"w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors resize-none\"",
  "required\n            className=\"w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors resize-none\""
);

code = code.replace(
  "type=\"number\"\n              min=\"0\"\n              value={price}",
  "type=\"number\"\n              min=\"0\"\n              required\n              value={price}"
);

fs.writeFileSync(file, code);
