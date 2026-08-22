const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

const chaptersRule = `
    match /chapters/{chapterId} {
      allow read: if true;
      allow create: if isAuthenticated() && (isAdmin() || isOwner(get(/databases/$(database)/documents/courses/$(request.resource.data.courseId)).data.instructorId));
      allow update, delete: if isAuthenticated() && (isAdmin() || isOwner(get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId));
    }
`;

const lessonsRule = `
    match /lessons/{lessonId} {
      allow read: if true;
      allow create: if isAuthenticated() && (isAdmin() || isOwner(get(/databases/$(database)/documents/courses/$(request.resource.data.courseId)).data.instructorId));
      allow update, delete: if isAuthenticated() && (isAdmin() || isOwner(get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId));
    }
`;

file = file.replace(/match \/chapters\/\{chapterId\} \{[\s\S]*?allow write:[\s\S]*?\}/, chaptersRule.trim());
file = file.replace(/match \/lessons\/\{lessonId\} \{[\s\S]*?allow write:[\s\S]*?\}/, lessonsRule.trim());

fs.writeFileSync('firestore.rules', file);
