const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'components', 'GoogleDriveFilePicker.tsx');

let code = fs.readFileSync(file, 'utf8');

code = code.replace(
`        const pickerOrigin = window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
           ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
           : window.location.origin;`,
`        const pickerOrigin = window.location.protocol + '//' + window.location.host;`
);

fs.writeFileSync(file, code);
console.log("Fixed pickerOrigin");
