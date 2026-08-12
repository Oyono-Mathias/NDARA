import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/res\.status\(500\)\.json\(\{ error: "Erreur serveur lors de la finalisation de l'inscription\." \}\);/g, 'res.status(500).json({ error: "Erreur: " + error.message });');

fs.writeFileSync('server.ts', content);
