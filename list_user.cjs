const admin = require('firebase-admin');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

// Only use GOOGLE_APPLICATION_CREDENTIALS if needed, or if we can't access it, we can't.
// Wait, the web app CAN access it because it's using the apiKey.
// I can make a script that uses the Web SDK to read the users collection!
// Since the rules allow `read: if true`, the web sdk can read it without authenticating.
