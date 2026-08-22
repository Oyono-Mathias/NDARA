import fs from 'fs';
let content = fs.readFileSync('src/controllers/uploadController.ts', 'utf8');
content = content.replace('return res.status(500).json({ error: "Failed to generate signed URL." });', 'console.error("Failed to generate signed url:", error); return res.status(500).json({ error: "Failed to generate signed URL.", detail: error.message });');
fs.writeFileSync('src/controllers/uploadController.ts', content);
