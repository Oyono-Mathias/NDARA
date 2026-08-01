const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const regex1 = /Délivré le: \{item\.issuedAt\?\.toDate \? item\.issuedAt\.toDate\(\)\.toLocaleDateString\(\) : ''\}/;
const replacement1 = `Délivré le: {item.issuedAt ? (typeof item.issuedAt === 'number' ? new Date(item.issuedAt).toLocaleDateString() : (item.issuedAt.toDate ? item.issuedAt.toDate().toLocaleDateString() : '')) : ''}`;
content = content.replace(regex1, replacement1);

const regex2 = /issuedAt: new Date\(\),/;
const replacement2 = `issuedAt: Date.now(),`;
content = content.replace(regex2, replacement2);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
