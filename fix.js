import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/  \}\);\n  \}\);\n\n  app\.post\("\/api\/user\/track"/g, '  });\n\n  app.post("/api/user/track"');

fs.writeFileSync('server.ts', content);
console.log("Fixed extra brace!");
