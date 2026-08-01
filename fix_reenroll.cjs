const fs = require('fs');
let content = fs.readFileSync('src/views/admin/AdminMemberProfileView.tsx', 'utf-8');

const regex = /\} else if \(action === 'remove_course'\) \{/;
const replacement = `} else if (action === 'reenroll_course') {
        const data = await promptUser("Réinscrire à une formation", [
          { name: 'courseId', label: 'ID de la formation', type: 'text' }
        ]);
        if (!data || !data.courseId) return;
        const q = query(collection(db, 'enrollments'), where('studentId', '==', memberId), where('courseId', '==', data.courseId));
        const snap = await getDocs(q);
        if (snap.empty) {
          toast({ title: "Non inscrit à cette formation", variant: "destructive" });
          return;
        }
        for (const docSnap of snap.docs) {
          await updateDoc(docSnap.ref, { progress: 0, completedLessons: [], completed: false });
        }
        await logAudit("REENROLL_COURSE", \`Réinscrit à la formation \${data.courseId}\`);
        toast({ title: "Réinscription effectuée" });
      } else if (action === 'remove_course') {`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/views/admin/AdminMemberProfileView.tsx', content);
