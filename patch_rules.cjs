const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

const courseRules = `
    match /courses/{courseId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.instructorId == request.auth.uid) || resource.data.status == 'published';
      allow create: if isAuthenticated() && (isAdmin() || request.auth.uid == request.resource.data.instructorId);
      allow update, delete: if isAuthenticated() && (isAdmin() || isOwner(resource.data.instructorId));
    }
    match /chapters/{chapterId} {
      allow read: if true; // TODO: refine chapter reads based on course status
      allow write: if isAuthenticated() && (isAdmin() || isOwner(get(/databases/$(database)/documents/courses/$(request.resource.data.courseId)).data.instructorId) || isOwner(get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId));
    }
    match /lessons/{lessonId} {
      allow read: if true; // TODO: refine lesson reads based on enrollment
      allow write: if isAuthenticated() && (isAdmin() || isOwner(get(/databases/$(database)/documents/courses/$(request.resource.data.courseId)).data.instructorId) || isOwner(get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId));
    }
`;

// Replace the existing course match block
file = file.replace(/match \/courses\/\{courseId\} \{[\s\S]*?(?=match \/\{path=\*\*\}\/assignments)/, courseRules);

fs.writeFileSync('firestore.rules', file);
