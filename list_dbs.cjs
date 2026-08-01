const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');

async function listDatabases() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/datastore']
  });
  const client = await auth.getClient();
  const projectId = 'gen-lang-client-0381307586';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;
  const res = await client.request({ url });
  console.log(res.data);
}
listDatabases().catch(console.error);
