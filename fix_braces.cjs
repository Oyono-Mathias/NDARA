const fs = require('fs');

const fixFile = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\(e\.message \|\| "([^"]+)" \}\);/g, '(e.message || "$1") });');
  content = content.replace(/\(error\.message \|\| "([^"]+)" \}\);/g, '(error.message || "$1") });');
  fs.writeFileSync(file, content, 'utf8');
}

[
  'src/components/instructor/announcements/AnnouncementsClient.tsx',
  'src/components/instructor/assignments/AssignmentsClient.tsx',
  'src/components/instructor/coupons/CouponFormModal.tsx',
  'src/components/instructor/course-content/ContentManager.tsx',
  'src/components/instructor/qna/QnaClient.tsx',
  'src/components/instructor/resources/ResourcesClient.tsx',
  'src/views/instructor/InstructorCoupons.tsx',
  'src/views/instructor/InstructorCourseEdit.tsx',
  'src/views/instructor/InstructorWealth.tsx'
].forEach(fixFile);

