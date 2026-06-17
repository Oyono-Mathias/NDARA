const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "ai-studio-c73c95ce-68aa-4b01-b061-8f1054e2e008" 
});
admin.firestore().collection('courses').limit(1).get()
  .then(() => console.log('Admin works!'))
  .catch((e) => console.error('Admin failed: ' + e));
