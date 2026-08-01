const fs = require('fs');
const path = require('path');

const f = path.join(__dirname, 'src', 'views', 'admin', 'AdminMemberProfileView.tsx');
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/await deleteDoc\(doc\(db, collectionName, id\)\);/g, 'await deleteDoc(doc(db, collectionName as string, id));');

// Let's replace instances of format() being called with a raw Timestamp or undefined
c = c.replace(/format\((user\.createdAt|enrollment\.enrolledAt|purchase\.createdAt)\.toDate\(\),\s*'dd\/MM\/yyyy'\)/g, 'format(($1 as any)?.toDate?.() || new Date(), \'dd/MM/yyyy\')');
c = c.replace(/format\(user\.lastLoginAt\.toDate\(\),\s*'dd\/MM\/yyyy'\)/g, 'format((user.lastLoginAt as any)?.toDate?.() || new Date(user.lastLoginAt || Date.now()), \'dd/MM/yyyy\')');

fs.writeFileSync(f, c);

