const fs = require('fs');

let file1 = fs.readFileSync('src/firebase.ts', 'utf8');
file1 = file1.replace("'ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008'", '(firebaseConfig as any).firestoreDatabaseId');
fs.writeFileSync('src/firebase.ts', file1);

let file2 = fs.readFileSync('src/firebaseServer.ts', 'utf8');
file2 = file2.replace("'ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008'", '(firebaseConfig as any).firestoreDatabaseId');
fs.writeFileSync('src/firebaseServer.ts', file2);

let file3 = fs.readFileSync('src/lib/firebaseAdmin.ts', 'utf8');
file3 = file3.replace("databaseId = 'ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008';", 'databaseId = config.firestoreDatabaseId;');
fs.writeFileSync('src/lib/firebaseAdmin.ts', file3);
