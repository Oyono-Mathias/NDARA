const fs = require('fs');
const dbId = "'ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008'";

let file1 = fs.readFileSync('src/lib/firebaseAdmin.ts', 'utf8');
file1 = file1.replace('databaseId = config.firestoreDatabaseId;', `databaseId = ${dbId};`);
fs.writeFileSync('src/lib/firebaseAdmin.ts', file1);
