const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

// Fix certificate generation logic
const regex = /await addDoc\(collection\(db, 'certificates'\), \{[\s\S]*?updatedAt: new Date\(\)\s*\}\);/;
const replacement = `await addDoc(collection(db, 'certificates'), {
            studentId: memberId,
            courseId: data.courseId,
            issuedAt: new Date(),
            certificateUrl: "https://example.com/cert.pdf",
            certificateNumber: Math.random().toString(36).substring(7).toUpperCase(),
            createdAt: new Date(),
            updatedAt: new Date()
          });`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
