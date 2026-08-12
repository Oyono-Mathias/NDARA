import fs from 'fs';

let content = fs.readFileSync('firestore.rules', 'utf8');
const regex = /allow create: if isAuthenticated\(\) && request\.auth\.uid == userId;/;
const replacement = `allow create: if false; // Creation is handled exclusively by the backend via /api/auth/complete-registration`;

if (content.includes('allow create: if isAuthenticated() && request.auth.uid == userId;')) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('firestore.rules', content);
  console.log("Patched rules create!");
} else {
  console.log("Could not find rules create regex.");
}
