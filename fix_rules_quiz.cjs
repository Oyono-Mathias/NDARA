const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// Replace quizzes
rules = rules.replace(
  /match \/quizzes\/\{id\} \{ allow read, write: if isAuthenticated\(\); \}/,
  `match /quizzes/{id} { 
      allow read: if isAuthenticated() && (resource.data.status == 'published' || resource.data.instructorId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && (request.resource.data.instructorId == request.auth.uid || isAdmin());
      allow update, delete: if isAuthenticated() && (resource.data.instructorId == request.auth.uid || isAdmin());
    }`
);

// Replace quiz_submissions
rules = rules.replace(
  /match \/quiz_submissions\/\{id\} \{ allow read, write: if isAuthenticated\(\); \}/,
  `match /quiz_submissions/{id} {
      allow read: if isAuthenticated() && (resource.data.studentId == request.auth.uid || resource.data.instructorId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.studentId == request.auth.uid; // Allow auto-save of answers by student
      allow update: if isAuthenticated() && (
        (resource.data.studentId == request.auth.uid && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['answers', 'updatedAt'])) || // Student auto-save
        (resource.data.instructorId == request.auth.uid && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['score', 'instructorFeedback', 'gradedAt', 'status'])) || // Instructor grading
        isAdmin()
      );
      allow delete: if isAdmin();
    }`
);

fs.writeFileSync('firestore.rules', rules);
