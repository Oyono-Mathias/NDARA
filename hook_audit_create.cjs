const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseCreate.tsx', 'utf8');

if (!code.includes('ModerationLogsService')) {
    code = code.replace(
        "import { collection, addDoc, serverTimestamp } from \"firebase/firestore\";",
        "import { collection, addDoc, serverTimestamp } from \"firebase/firestore\";\nimport { ModerationLogsService } from \"../../services/db\";"
    );
    
    code = code.replace(
        /const docRef = await addDoc\(collection\(db, "courses"\), payload\);/,
        `const docRef = await addDoc(collection(db, "courses"), payload);
      await ModerationLogsService.create({
        entityId: docRef.id,
        entityType: 'course',
        action: 'COURSE_CREATED',
        actorId: currentUser.uid,
        timestamp: Date.now()
      });`
    );
    fs.writeFileSync('src/views/instructor/InstructorCourseCreate.tsx', code);
}
