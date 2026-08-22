const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./firebase-applet-config.json');

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.projectId,
      clientEmail: "firebase-adminsdk-dummy@dummy.iam.gserviceaccount.com",
      privateKey: "dummy" 
    })
  });
}
console.log("Starting script");
