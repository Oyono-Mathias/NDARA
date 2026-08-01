const fs = require('fs');
const files = [
  'src/components/instructor/announcements/AnnouncementsClient.tsx',
  'src/components/instructor/assignments/AssignmentsClient.tsx',
  'src/components/instructor/coupons/CouponFormModal.tsx',
  'src/components/instructor/course-content/ContentManager.tsx',
  'src/components/instructor/qna/QnaClient.tsx',
  'src/components/instructor/resources/ResourcesClient.tsx',
  'src/views/instructor/InstructorCoupons.tsx',
  'src/views/instructor/InstructorCourseEdit.tsx',
  'src/views/instructor/InstructorWealth.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Fix missing closing parenthesis for String()
    content = content.replace(/description:\s*String\(([^}]+?)\s*\}\);/g, (match, inner) => {
       // if inner doesn't have matching parentheses, we add one
       let openCount = (inner.match(/\(/g) || []).length;
       let closeCount = (inner.match(/\)/g) || []).length;
       
       // actually, wait. it might be easier to just remove String() wrapper completely because it's just a string concat!
       return `description: ${inner} });`;
    });
    
    // There are some errors like "src/views/instructor/InstructorCoupons.tsx(35,176): error TS1005: ')' expected."
    // Let's also remove String() wrapper for these.
    content = content.replace(/description:\s*String\(([^}]*?)\s*\)\s*\}\);/g, (match, inner) => {
       return `description: ${inner} });`;
    });
    
    fs.writeFileSync(f, content, 'utf8');
  }
});
