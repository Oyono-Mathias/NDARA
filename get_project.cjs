const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
console.log(admin.app().options.credential.getProjectId ? admin.app().options.credential.getProjectId() : 'no method');
admin.app().options.credential.getAccessToken().then(token => {
   const jwt = require('jsonwebtoken');
   console.log(jwt.decode(token.access_token));
}).catch(console.error);
