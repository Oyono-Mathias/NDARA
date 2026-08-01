const fs = require('fs');
let file = 'src/views/Account.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('if (!(await (await confirm("Envoyer une demande pour devenir formateur (expert))) ?")) return;', 'if (!(await confirm("Envoyer une demande pour devenir formateur (expert) ?"))) return;');
fs.writeFileSync(file, content, 'utf8');
