const fs = require('fs');
const file = 'src/views/instructor/InstructorCourseFinalisation.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "import { Check, Edit2, Play, FileText, Link as LinkIcon, MonitorPlay, AlertTriangle, ArrowLeft } from 'lucide-react';",
    "import { Check, Edit2, Play, FileText, Link as LinkIcon, MonitorPlay, AlertTriangle, ArrowLeft, Loader2, Send } from 'lucide-react';"
);

content = content.replace(/course\?\.description/g, 'course?.shortDescription');
content = content.replace(/course\.description/g, 'course.shortDescription');

content = content.replace(/course\?\.coverUrl/g, 'course?.thumbnail');
content = content.replace(/course\.coverUrl/g, 'course.thumbnail');

content = content.replace(/course\?\.learningObjectives/g, 'course?.objectives');
content = content.replace(/course\.learningObjectives/g, 'course.objectives');

content = content.replace(/course\.promotionalPrice/g, 'course.promoPrice');

content = content.replace(/l\.type === 'article'/g, "l.type === 'text'");
content = content.replace(/if \(l\.type === 'link'\) return !!l\.videoUrl;/g, ""); // remove the line

fs.writeFileSync(file, content);
console.log('patched finalisation');
