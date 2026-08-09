const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;`;
const replacement = `let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
      if (ip && typeof ip === 'string' && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }`;

code = code.replace(target, replacement);

const targetClick = `const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Non disponible";`;
const replacementClick = `let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Non disponible";
      if (ip && typeof ip === 'string' && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }`;
code = code.replace(targetClick, replacementClick);

fs.writeFileSync('server.ts', code);
