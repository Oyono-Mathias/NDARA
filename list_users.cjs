const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const projectId = 'gen-lang-client-0381307586';
const databaseId = 'ai-studio-ndaraafrique-c73c95ce-68aa-4b01-b061-8f1054e2e008';

const admin = require('firebase-admin');
if (!admin.apps.length) {
    admin.initializeApp({ projectId });
}

const db = getFirestore(admin.app(), databaseId);

db.collection('users').get().then(snap => {
    console.log("Users in DB:", snap.size);
    snap.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
    });
}).catch(console.error);
