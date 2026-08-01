const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', 'utf8');

const notifLogic = `
      // Notify students (fire and forget)
      if (status === 'published') {
        (async () => {
          try {
            const enrollmentsRef = collection(db, 'enrollments');
            const qE = query(enrollmentsRef, where('courseId', '==', selectedCourse));
            const enrollSnap = await getDocs(qE);
            
            const batch = writeBatch(db);
            enrollSnap.forEach(docSnap => {
              const studentId = docSnap.data().studentId;
              if (studentId) {
                const notifRef = doc(collection(db, \`users/\${studentId}/notifications\`));
                batch.set(notifRef, {
                  title: "Nouveau devoir disponible",
                  message: \`Un nouveau devoir "\${newTitle}" a été ajouté à la formation "\${courseObj?.title || 'Formation'}".\`,
                  type: 'assignment_created',
                  link: '/student/devoirs',
                  read: false,
                  createdAt: serverTimestamp()
                });
              }
            });
            await batch.commit();
          } catch (e) {
            console.warn("Failed to send notifications", e);
          }
        })();
      }
`;

code = code.replace(/\/\/ Notify students[\s\S]*?(?=\} catch \(error: any\))/m, notifLogic);

fs.writeFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', code);
