const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'instructor', 'course-content', 'ContentManager.tsx');

let code = fs.readFileSync(file, 'utf8');

code = code.replace(
/const picker = new \(window as any\)\.google\.picker\.PickerBuilder\(\)/g,
`const picker = new (window as any).google.picker.PickerBuilder().setAppId('gen-lang-client-0381307586')`
);

fs.writeFileSync(file, code);
console.log("Fixed picker in ContentManager");
