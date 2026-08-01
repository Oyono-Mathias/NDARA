const fs = require('fs');
let code = fs.readFileSync('src/views/Assignments.tsx', 'utf8');

code = code.replace(/const assignmentsQuery = query\(collectionGroup\(db, 'assignments'\), orderBy\('createdAt', 'desc'\)\);/, `const assignmentsQuery = query(collectionGroup(db, 'assignments'));`);

code = code.replace(/const filtered = assignSnap\.docs\n\s*\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\)\n\s*\.filter\(\(a: any\) => enrolledCourseIds\.includes\(a\.courseId\)\);/g, `const filtered = assignSnap.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter((a: any) => enrolledCourseIds.includes(a.courseId))
                        .sort((a: any, b: any) => {
                            const dA = a.createdAt?.toMillis?.() || 0;
                            const dB = b.createdAt?.toMillis?.() || 0;
                            return dB - dA;
                        });`);

// also remove orderBy from imports if it's unused, though keeping it is harmless.

fs.writeFileSync('src/views/Assignments.tsx', code, 'utf8');
