import fs from 'fs';

let content = fs.readFileSync('firestore.rules', 'utf8');

const regex = /allow update: if isAdmin\(\) \|\| \(isAuthenticated\(\) && request\.auth\.uid == userId && \(!request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasAny\(\['referredBy', 'referralCode', 'referredAt'\]\)\)\);/;
const replacement = `allow update: if isAdmin() || (isAuthenticated() && request.auth.uid == userId && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'createdAt', 'uid', 'walletBalance', 'referredBy', 'referralCode', 'referredAt'])));`;

if (content.includes('allow update: if isAdmin() || (isAuthenticated() && request.auth.uid == userId')) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('firestore.rules', content);
  console.log("Patched rules!");
} else {
  console.log("Could not find rules regex.");
}
