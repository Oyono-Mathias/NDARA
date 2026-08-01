const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'GoogleDriveFilePicker.tsx');

let code = fs.readFileSync(file, 'utf8');

// replace pickerOrigin logic
code = code.replace(
/const pickerOrigin = window\.location\.ancestorOrigins[\s\S]*?\? window\.location\.ancestorOrigins\[window\.location\.ancestorOrigins\.length - 1\]\s*: window\.location\.origin;/g,
`const pickerOrigin = window.location.protocol + '//' + window.location.host;`
);

// Add developerKey and appId if possible? 
// Actually, let's just make sure we set App ID.
// project_id is gen-lang-client-0381307586. 
// Number is 0381307586 or maybe just let it be without appId.

code = code.replace(
/const picker = new \(window as any\)\.google\.picker\.PickerBuilder\(\)/g,
`const picker = new (window as any).google.picker.PickerBuilder().setAppId('gen-lang-client-0381307586')`
);

fs.writeFileSync(file, code);
console.log("Fixed pickerOrigin in GoogleDriveFilePicker");
