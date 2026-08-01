const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
config.firestoreDatabaseId = 'ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008';
fs.writeFileSync('firebase-applet-config.json', JSON.stringify(config, null, 2));
console.log('Config updated');
