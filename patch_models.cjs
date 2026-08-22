const fs = require('fs');
const file = 'src/types/models.ts';
let content = fs.readFileSync(file, 'utf8');

if (content.includes('export interface Course extends BaseModel {') && !content.includes('promoPrice?: number;')) {
    content = content.replace(
        "price: number;",
        "price: number;\n  promoPrice?: number;\n  promoStart?: string | Date | any;\n  promoEnd?: string | Date | any;\n  certificateEnabled?: boolean;\n  certificateName?: string;"
    );
    fs.writeFileSync(file, content);
    console.log('Course model updated');
} else {
    console.log('Course model already updated or not found');
}
