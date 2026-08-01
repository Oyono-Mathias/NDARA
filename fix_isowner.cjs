const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/request\.auth\.uid == request\.resource\.data\.instructorId/g, 'isOwner(request.resource.data.instructorId)');
code = code.replace(/request\.auth\.uid == resource\.data\.instructorId/g, 'isOwner(resource.data.instructorId)');

fs.writeFileSync('firestore.rules', code);
