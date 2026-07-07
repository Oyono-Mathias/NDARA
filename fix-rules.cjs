const fs = require('fs');

const collections = [
  'assignments_submissions', 'audit_logs', 'course_qna', 'course_reviews', 'courses', 
  'enrollments', 'market_ebooks', 'payout_requests', 'purchases', 'quiz_results', 
  'quiz_submissions', 'quizzes', 'student_badges', 'transactions', 'user_history', 
  'users', 'user_wishlist', 'lessons', 'categories', 'progress', 'user_progress',
  'certificates', 'downloads', 'ebooks', 'marketplace', 'wallets', 'walletTransactions',
  'notifications', 'conversations', 'messages', 'communities', 'squads', 'sandboxProjects',
  'templates', 'favorites', 'ambassadors', 'leaderboard', 'supportTickets', 'roles',
  'settings', 'system_settings', 'statistics', 'reports', 'payments', 'licenses',
  'market_data', 'market_orders', 'market_templates', 'squad_messages', 'support_tickets'
];

let rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isAdmin() { 
      return isAuthenticated() && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin'
      ); 
    }
    match /{document=**} {
      allow read, write: if false;
    }
`;

for (const col of collections) {
  rules += `
    match /${col}/{id} {
      allow read, write: if isAuthenticated();
    }
`;
}

rules += `
    match /courses/{courseId}/chapters/{chapterId} {
      allow read, write: if isAuthenticated();
    }
    match /courses/{courseId}/assignments/{assignmentId} {
      allow read, write: if isAuthenticated();
    }
    match /courses/{courseId}/quizzes/{quizId} {
      allow read, write: if isAuthenticated();
    }
    match /users/{userId}/notifications/{notifId} {
      allow read, write: if isAuthenticated();
    }
    match /users/{userId}/transactions/{txId} {
      allow read, write: if isAuthenticated();
    }
  }
}
`;

fs.writeFileSync('firestore.rules', rules);
