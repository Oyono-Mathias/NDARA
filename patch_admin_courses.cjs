const fs = require('fs');
let file = fs.readFileSync('src/views/admin/catalogue/CoursesManager.tsx', 'utf8');

file = file.replace(/course\.status === 'published' \? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'/g, 
  "course.status === 'published' ? 'bg-emerald-500 text-slate-950' : course.status === 'pending_review' ? 'bg-blue-500 text-white' : course.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'");

file = file.replace(/\{course\.status === 'published' \? 'Publié' : 'Brouillon'\}/g, 
  "{course.status === 'published' ? 'Publié' : course.status === 'pending_review' ? 'En révision' : course.status === 'rejected' ? 'Rejeté' : 'Brouillon'}");

fs.writeFileSync('src/views/admin/catalogue/CoursesManager.tsx', file);
