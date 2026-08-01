const fs = require('fs');

let file1 = fs.readFileSync('src/firebase.ts', 'utf8');
file1 = file1.replace('firebaseConfig.firestoreDatabaseId', '(firebaseConfig as any).firestoreDatabaseId');
fs.writeFileSync('src/firebase.ts', file1);

let file2 = fs.readFileSync('src/firebaseServer.ts', 'utf8');
file2 = file2.replace('firebaseConfig.firestoreDatabaseId', '(firebaseConfig as any).firestoreDatabaseId');
fs.writeFileSync('src/firebaseServer.ts', file2);
