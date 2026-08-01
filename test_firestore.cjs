const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'gen-lang-client-0381307586',
  credential: admin.credential.applicationDefault()
});
const db = admin.firestore();
db.collection('users').limit(1).get().then(() => console.log('default works')).catch(e => console.log('default failed', e.message));

const db2 = admin.firestore(admin.app(), 'ai-logic');
db2.collection('users').limit(1).get().then(() => console.log('ai-logic works')).catch(e => console.log('ai-logic failed', e.message));

const db3 = admin.firestore(admin.app(), 'ai_logic');
db3.collection('users').limit(1).get().then(() => console.log('ai_logic works')).catch(e => console.log('ai_logic failed', e.message));
