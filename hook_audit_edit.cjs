const fs = require('fs');
let code = fs.readFileSync('src/views/instructor/InstructorCourseEdit.tsx', 'utf8');

if (!code.includes('ModerationLogsService')) {
    code = code.replace(
        "import { useCourseBuilder } from \"../../hooks/catalog/useCatalogAdmin\";",
        "import { useCourseBuilder } from \"../../hooks/catalog/useCatalogAdmin\";\nimport { ModerationLogsService } from \"../../services/db\";"
    );
    
    code = code.replace(
        /setCourse\(\{ \.\.\.course, status: "pending_review" \}\);/,
        `setCourse({ ...course, status: "pending_review" });
      await ModerationLogsService.create({
        entityId: course.id,
        entityType: 'course',
        action: 'COURSE_SUBMITTED',
        actorId: currentUser.uid,
        timestamp: Date.now()
      });`
    );
    fs.writeFileSync('src/views/instructor/InstructorCourseEdit.tsx', code);
}
