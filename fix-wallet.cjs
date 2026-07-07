const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

code = code.replace(/\.exists\(\)/g, ".exists");
code = code.replace(/addDoc\(([^,]+), (\{[^}]+\})\)/g, "$1.add($2)");

// Fixing query()
// src/lib/walletProcessor.ts(125,17): const q = query(collection(serverDb, 'enrollments'), where('instructorId', '==', receiverId));
code = code.replace(/query\(collection\(serverDb, '([^']+)'\), where\('([^']+)', '==', ([^)]+)\)\)/g, "serverDb.collection('$1').where('$2', '==', $3)");
code = code.replace(/query\(serverDb\.collection\('([^']+)'\), where\('([^']+)', '==', ([^)]+)\)\)/g, "serverDb.collection('$1').where('$2', '==', $3)");

// src/lib/walletProcessor.ts(216) const enrollmentsQuery = query(serverDb.collection('enrollments'), where('studentId', '==', studentId), where('courseId', '==', courseId));
code = code.replace(/query\(serverDb\.collection\('([^']+)'\), where\('([^']+)', '==', ([^)]+)\), where\('([^']+)', '==', ([^)]+)\)\)/g, "serverDb.collection('$1').where('$2', '==', $3).where('$4', '==', $5)");

// src/lib/walletProcessor.ts(375) const txQuery = query(transactionsColl, orderBy('createdAt', 'desc'), limit(10));
code = code.replace(/query\(([^,]+), orderBy\('([^']+)', '([^']+)'\), limit\(([^)]+)\)\)/g, "$1.orderBy('$2', '$3').limit($4)");

// src/lib/walletProcessor.ts(458) if (reqSnap.empty) throw new Error('Payout request not found'); // getDocs returns empty, get returns exists
code = code.replace(/!reqSnap\.exists/g, "reqSnap.empty");
code = code.replace(/reqSnap\.data\(\)/g, "reqSnap.docs[0].data()");
code = code.replace(/reqSnap\.id/g, "reqSnap.docs[0].id");


fs.writeFileSync('src/lib/walletProcessor.ts', code);
