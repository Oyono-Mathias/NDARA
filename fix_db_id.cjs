const fs = require('fs');
const dbId = "'ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008'";

let file1 = fs.readFileSync('src/firebase.ts', 'utf8');
file1 = file1.replace('(firebaseConfig as any).firestoreDatabaseId', dbId);
fs.writeFileSync('src/firebase.ts', file1);

let file2 = fs.readFileSync('src/firebaseServer.ts', 'utf8');
file2 = file2.replace('(firebaseConfig as any).firestoreDatabaseId', dbId);
fs.writeFileSync('src/firebaseServer.ts', file2);
