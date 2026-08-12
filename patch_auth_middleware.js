import fs from 'fs';

let content = fs.readFileSync('src/middlewares/authMiddleware.ts', 'utf8');

const regex = /\/\/ Attempt to enrich with Firestore user data to ensure we have the role[\s\S]*?req\.user = decodedToken;/;
const replacement = `// Attempt to enrich with Firestore user data using adminDb
    try {
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        decodedToken.role = userDoc.data()?.role || "student";
      } else {
        decodedToken.role = "student";
      }
    } catch (e) {
      logger.error("Failed to load user document for role enrichment via adminDb:", e);
    }

    req.user = decodedToken;`;

if(content.includes('Attempt to enrich with Firestore user data')) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/middlewares/authMiddleware.ts', content);
    console.log("Patched authMiddleware!");
} else {
    console.log("Regex didn't match.");
}
