const fs = require('fs');
const path = require('path');

function replaceAll(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(search).join(replace);
  fs.writeFileSync(file, content);
}

const f = path.join(__dirname, 'src', 'views', 'admin', 'AdminMemberProfileView.tsx');
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/await deleteDoc\(doc\(db, collectionName, id\)\);/g, 'await deleteDoc(doc(db, collectionName as string, id));');
c = c.replace(/<Skeleton className/g, '<div className');
c = c.replace(/<\/Skeleton>/g, '</div>');

fs.writeFileSync(f, c);

const f2 = path.join(__dirname, 'src', 'views', 'admin', 'AdminMembers.tsx');
if (fs.existsSync(f2)) {
  let c2 = fs.readFileSync(f2, 'utf8');
  c2 = c2.replace(/<Skeleton className/g, '<div className');
  c2 = c2.replace(/<\/Skeleton>/g, '</div>');
  fs.writeFileSync(f2, c2);
}

const f3 = path.join(__dirname, 'src', 'views', 'admin', 'AdminMonitoring.tsx');
if (fs.existsSync(f3)) {
  let c3 = fs.readFileSync(f3, 'utf8');
  c3 = c3.replace(/<Skeleton className/g, '<div className');
  c3 = c3.replace(/<\/Skeleton>/g, '</div>');
  fs.writeFileSync(f3, c3);
}

const f4 = path.join(__dirname, 'src', 'views', 'admin', 'catalogue', 'CourseBuilder.tsx');
if (fs.existsSync(f4)) {
  let c4 = fs.readFileSync(f4, 'utf8');
  c4 = c4.replace(/setCourse\(\(prev\) => \(\{ \.\.\.prev, targetAudience: e\.target\.value \}\)\);/g, 'setCourse((prev: any) => ({ ...prev, targetAudience: e.target.value as any }));');
  c4 = c4.replace(/setCourse\(\(prev\) => \(\{ \.\.\.prev, level: e\.target\.value as unknown as Record<string, unknown> \}\)\);/g, 'setCourse((prev: any) => ({ ...prev, level: e.target.value as any }));');
  fs.writeFileSync(f4, c4);
}

const f5 = path.join(__dirname, 'src', 'views', 'instructor', 'InstructorProfile.tsx');
if (fs.existsSync(f5)) {
  let c5 = fs.readFileSync(f5, 'utf8');
  c5 = c5.replace(/followers: 1200,/g, '');
  c5 = c5.replace(/<p className="text-2xl font-black text-white">{stats\.followers}<\/p>/g, '');
  c5 = c5.replace(/<StatCard icon={<Users \/>} label="Abonnés" value={stats.followers} \/>/g, '');
  fs.writeFileSync(f5, c5);
}
console.log('Fixed TS errors in Admin files and InstructorProfile');
