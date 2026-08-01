const fs = require('fs');
const file = 'tsconfig.json';
let config = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!config.exclude) config.exclude = [];
if (!config.exclude.includes("uploads")) config.exclude.push("uploads");
fs.writeFileSync(file, JSON.stringify(config, null, 2));
