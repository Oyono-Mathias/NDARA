const { GoogleAuth } = require('google-auth-library');
async function run() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  });
  const client = await auth.getClient();
  const projectId = 'gen-lang-client-0381307586';
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;
  const res = await client.request({ url });
  console.log(JSON.stringify(res.data, null, 2));
}
run().catch(console.error);
