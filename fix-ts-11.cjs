const fs = require('fs');

let tm = fs.readFileSync('src/views/TemplateMarket.tsx', 'utf8');
tm = tm.replace(/\(\(\) => \{\}\)\(selectedTemplate\.id\)/g, '(() => {})()');
fs.writeFileSync('src/views/TemplateMarket.tsx', tm);
