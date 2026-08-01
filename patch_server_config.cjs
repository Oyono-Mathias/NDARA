const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replaceAll('adminDb.collection("platform").doc("config").get()', "adminDb.collection('settings').doc('global_config').get()");
fs.writeFileSync('server.ts', content);
