import fs from 'fs';
const content = fs.readFileSync('src/views/admin/AdminDashboard.tsx', 'utf8');

console.log(content.substring(0, 1000));
