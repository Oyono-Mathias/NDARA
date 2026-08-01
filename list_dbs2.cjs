const { google } = require('googleapis');
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

async function listDatabases() {
  const client = await admin.app().options.credential.getAccessToken();
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/gen-lang-client-0381307586/databases`, {
      headers: {
          'Authorization': `Bearer ${client.access_token}`
      }
  });
  console.log(res.status, await res.text());
}
listDatabases().catch(console.error);
