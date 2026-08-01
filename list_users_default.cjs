const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const projectId = 'gen-lang-client-0381307586';

const admin = require('firebase-admin');
if (!admin.apps.length) {
    admin.initializeApp({ projectId });
}

// using default db
const db = getFirestore(admin.app());

db.collection('users').get().then(snap => {
    console.log("Users in default DB:", snap.size);
}).catch(console.error);
