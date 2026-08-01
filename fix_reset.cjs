const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const regexProgress = /if \(await confirm\("Réinitialiser la progression \?"\)\) \{\s*\/\/[^\n]*\s*await logAudit\("RESET_PROGRESS", `Progression réinitialisée`\);\s*toast\(\{ title: "Progression réinitialisée" \}\);\s*\}/;
const replacementProgress = `if (await confirm("Réinitialiser la progression ?")) {
          const q = query(collection(db, 'enrollments'), where('studentId', '==', memberId));
          const snap = await getDocs(q);
          for (const docSnap of snap.docs) {
            await updateDoc(docSnap.ref, { progress: 0, completedLessons: [], completed: false });
          }
          await logAudit("RESET_PROGRESS", \`Progression réinitialisée pour tous les cours\`);
          toast({ title: "Progression réinitialisée" });
        }`;
content = content.replace(regexProgress, replacementProgress);


const regexQuiz = /if \(await confirm\("Réinitialiser les quiz \?"\)\) \{\s*await logAudit\("RESET_QUIZZES", `Quizzes réinitialisés`\);\s*toast\(\{ title: "Quiz réinitialisés" \}\);\s*\}/;
const replacementQuiz = `if (await confirm("Réinitialiser les quiz ?")) {
          const q = query(collection(db, 'quiz_attempts'), where('userId', '==', memberId));
          const snap = await getDocs(q);
          for (const docSnap of snap.docs) {
            await deleteDoc(docSnap.ref);
          }
          await logAudit("RESET_QUIZZES", \`Quizzes réinitialisés\`);
          toast({ title: "Quiz réinitialisés" });
        }`;
content = content.replace(regexQuiz, replacementQuiz);


const regexAssignments = /if \(await confirm\("Réinitialiser les devoirs \?"\)\) \{\s*await logAudit\("RESET_ASSIGNMENTS", `Devoirs réinitialisés`\);\s*toast\(\{ title: "Devoirs réinitialisés" \}\);\s*\}/;
const replacementAssignments = `if (await confirm("Réinitialiser les devoirs ?")) {
          const q = query(collection(db, 'assignment_submissions'), where('studentId', '==', memberId));
          const snap = await getDocs(q);
          for (const docSnap of snap.docs) {
            await deleteDoc(docSnap.ref);
          }
          await logAudit("RESET_ASSIGNMENTS", \`Devoirs réinitialisés\`);
          toast({ title: "Devoirs réinitialisés" });
        }`;
content = content.replace(regexAssignments, replacementAssignments);

fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
