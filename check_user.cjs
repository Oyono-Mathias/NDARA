const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
async function run() {
  const users = await admin.firestore().collection('users').where('email', '==', 'oyonomathias@gmail.com').get();
  users.forEach(doc => console.log(doc.id, doc.data().role));
}
run();
