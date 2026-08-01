const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/views/ambassador/AmbassadorCommissions.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    'const combined = docs.map(d => ({',
    'const combined = docs.map((d: any) => ({'
);

code = code.replace(
    'const uids = [...new Set(docs.map(d => d.referralUid))];',
    'const uids = [...new Set(docs.map((d: any) => d.referralUid))];'
);

fs.writeFileSync(file, code);
console.log("Types fixed in AmbassadorCommissions");
