const { GoogleAuth } = require('google-auth-library');
async function check() {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const projectId = await auth.getProjectId();
  console.log("Project:", projectId);
  if (client.email) console.log("Email:", client.email);
  const credentials = await auth.getCredentials();
  console.log("Credentials keys:", Object.keys(credentials));
}
check().catch(console.error);
