const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

const newCoursesBlock = `
    match /courses/{courseId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.instructorId == request.auth.uid) || resource.data.status == 'published';
      allow create: if isAuthenticated() && (isAdmin() || request.auth.uid == request.resource.data.instructorId);
      allow update: if isAuthenticated() && (
        isAdmin() || 
        (isOwner(resource.data.instructorId) && (
          !request.resource.data.diff(resource.data).affectedKeys().hasAny(['status']) || 
          (request.resource.data.status in ['draft', 'pending_review', 'archived'])
        ))
      );
      allow delete: if isAuthenticated() && (isAdmin() || isOwner(resource.data.instructorId));
    }
`;

file = file.replace(/match \/courses\/\{courseId\} \{[\s\S]*?allow update, delete: if isAuthenticated\(\) && \(isAdmin\(\) \|\| isOwner\(resource\.data\.instructorId\)\);\s*\}/, newCoursesBlock.trim());

fs.writeFileSync('firestore.rules', file);
