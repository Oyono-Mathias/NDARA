const fs = require('fs');
let code = fs.readFileSync('src/routes/gamificationRoutes.ts', 'utf8');

code = code.replace(
  /const usersSnap = await adminDb\.collection\('users'\)\.where\('role', '==', 'ambassador'\)\.get\(\);/,
  "const ambDocs = await adminDb.collection('ambassadors').get();\nconst uids = ambDocs.docs.map(d => d.id).slice(0, 30);\nconst usersSnap = uids.length > 0 ? await adminDb.collection('users').where(adminDb.firestore.FieldPath.documentId(), 'in', uids).get() : { forEach: () => {} };"
);

code = code.replace(
  /const ambSnap = await adminDb\.collection\('users'\)\.where\('role', '==', 'ambassador'\)\.get\(\);/,
  "const ambassadorsQuery = await adminDb.collection('ambassadors').get();\nconst ambUids = ambassadorsQuery.docs.map(d => d.id).slice(0, 30);\nconst ambSnap = ambUids.length > 0 ? await adminDb.collection('users').where(adminDb.firestore.FieldPath.documentId(), 'in', ambUids).get() : { forEach: () => {} };"
);

fs.writeFileSync('src/routes/gamificationRoutes.ts', code);
