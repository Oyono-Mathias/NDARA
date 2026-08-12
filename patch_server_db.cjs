const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const \{ adminDb, admin \} = await import\('\.\/src\/lib\/firebaseAdmin\.js'\);[\s\S]*?await adminDb\.runTransaction\(async \(transaction: any\) => \{/g;

// Fallback to REST API for transaction because Firebase Admin doesn't have IAM in AI Studio.
// Note: We can't easily mock transactions with REST in 5 minutes, let's just make the backend use standard client SDK.
