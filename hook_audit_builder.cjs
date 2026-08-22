const fs = require('fs');
let code = fs.readFileSync('src/hooks/catalog/useCatalogAdmin.ts', 'utf8');

if (!code.includes('ModerationLogsService')) {
    code = code.replace(
        "import { CategoriesService, CoursesService, ChaptersService, LessonsService } from '../../services/db';",
        "import { CategoriesService, CoursesService, ChaptersService, LessonsService, ModerationLogsService } from '../../services/db';\nimport { auth } from '../../firebase';"
    );
    
    code = code.replace(
        /const deleteChapter = async \(id: string\) => ChaptersService\.update\(id, \{ status: 'archived' \}\);/,
        `const deleteChapter = async (id: string) => {
    await ChaptersService.update(id, { status: 'archived' });
    if (auth.currentUser) {
      await ModerationLogsService.create({ entityId: id, entityType: 'chapter', action: 'CHAPTER_DELETED', actorId: auth.currentUser.uid, timestamp: Date.now() });
    }
  };`
    );

    code = code.replace(
        /const deleteLesson = async \(id: string\) => LessonsService\.update\(id, \{ status: 'archived' \}\);/,
        `const deleteLesson = async (id: string) => {
    await LessonsService.update(id, { status: 'archived' });
    if (auth.currentUser) {
      await ModerationLogsService.create({ entityId: id, entityType: 'lesson', action: 'LESSON_DELETED', actorId: auth.currentUser.uid, timestamp: Date.now() });
    }
  };`
    );

    fs.writeFileSync('src/hooks/catalog/useCatalogAdmin.ts', code);
}
