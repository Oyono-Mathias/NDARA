const fs = require('fs');
const file = 'src/types/models.ts';
let content = fs.readFileSync(file, 'utf8');

if (content.includes('export interface Course extends BaseModel {') && !content.includes('dripEnabled?: boolean;')) {
    content = content.replace(
        "certificateName?: string;",
        "certificateName?: string;\n  dripEnabled?: boolean;\n  dripIntervalDays?: number;\n  completionVideoPercent?: number;\n  completionQuizScore?: number;"
    );
    fs.writeFileSync(file, content);
    console.log('Course model updated with drip and completion params');
} else {
    console.log('Course model already updated or not found');
}
