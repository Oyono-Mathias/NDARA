const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Move the migrate route up
const migrateBlockMatch = code.match(/app\.post\("\/api\/admin\/ambassadors\/migrate", async \([^]*?\}\);/);
if (migrateBlockMatch) {
  code = code.replace(migrateBlockMatch[0], '');
  // Insert it right before "if (process.env.NODE_ENV !== 'production') {"
  code = code.replace("if (process.env.NODE_ENV !== 'production') {", migrateBlockMatch[0].replace('app.post', 'app.get') + "\n\n  if (process.env.NODE_ENV !== 'production') {");
  fs.writeFileSync('server.ts', code);
}
