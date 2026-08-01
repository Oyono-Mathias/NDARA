const fs = require('fs');
const path = './src/lib/r2Upload.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/throw new Error\("L'upload a 00e9chou00e9 : le serveur de stockage n'est pas configur00e9 correctement\."\);/, 'throw new Error("L\'upload a échoué : le serveur de stockage n\'est pas configuré correctement.");');
fs.writeFileSync(path, code);
