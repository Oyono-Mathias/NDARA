const fs = require('fs');

// 1. Add model
let models = fs.readFileSync('src/types/models.ts', 'utf8');
if (!models.includes('export interface ModerationLog')) {
    models += `\n\nexport interface ModerationLog extends BaseModel {
  entityId: string;
  entityType: 'course' | 'chapter' | 'lesson';
  action: 'COURSE_CREATED' | 'COURSE_SUBMITTED' | 'CHAPTER_DELETED' | 'LESSON_DELETED' | 'COURSE_REJECTED' | 'COURSE_PUBLISHED';
  actorId: string; // The user who performed the action
  details?: string;
  timestamp: number;
}\n`;
    fs.writeFileSync('src/types/models.ts', models);
}

// 2. Add service
let services = fs.readFileSync('src/services/db/index.ts', 'utf8');
if (!services.includes('ModerationLogsService')) {
    services += `\nexport const ModerationLogsService = new BaseService<Models.ModerationLog>('moderation_logs');\n`;
    fs.writeFileSync('src/services/db/index.ts', services);
}

