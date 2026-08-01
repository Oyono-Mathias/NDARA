const fs = require('fs');
let code = fs.readFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', 'utf8');

const notifLogic = `
      // Notify student
      if (selectedSubmission?.studentId) {
        const notifRef = doc(collection(db, \`users/\${selectedSubmission.studentId}/notifications\`));
        setDoc(notifRef, {
          title: "Devoir noté",
          message: \`Votre devoir a été noté. Note: \${Number(grade)}/20.\`,
          type: 'assignment_graded',
          link: '/student/devoirs',
          read: false,
          createdAt: serverTimestamp()
        }).catch(e => console.warn("Failed to send notification", e));
      }
`;

const aiNotifLogic = `
      // Notify student
      if (selectedSubmission?.studentId) {
        const notifRef = doc(collection(db, \`users/\${selectedSubmission.studentId}/notifications\`));
        setDoc(notifRef, {
          title: "Devoir noté",
          message: \`Votre devoir a été noté. Note: \${data.finalGrade || 0}/20.\`,
          type: 'assignment_graded',
          link: '/student/devoirs',
          read: false,
          createdAt: serverTimestamp()
        }).catch(e => console.warn("Failed to send notification", e));
      }
`;

code = code.replace(/setGradeSuccess\(true\);\n\s*setTimeout\(\(\) => \{\n\s*setGradeSuccess\(false\);\n\s*setSelectedSubmission\(null\);\n\s*setGrade\(\"\"\);\n\s*setFeedback\(\"\"\);\n\s*\}, 2000\);/g, `setGradeSuccess(true);\n${notifLogic}\n      setTimeout(() => {\n        setGradeSuccess(false);\n        setSelectedSubmission(null);\n        setGrade("");\n        setFeedback("");\n      }, 2000);`);

code = code.replace(/setGradeSuccess\(true\);\n\s*setTimeout\(\(\) => \{\n\s*setGradeSuccess\(false\);\n\s*setSelectedSubmission\(null\);\n\s*setGrade\(\"\"\);\n\s*setFeedback\(\"\"\);\n\s*\}, 3000\);/g, `setGradeSuccess(true);\n${aiNotifLogic}\n      setTimeout(() => {\n        setGradeSuccess(false);\n        setSelectedSubmission(null);\n        setGrade("");\n        setFeedback("");\n      }, 3000);`);


fs.writeFileSync('src/components/instructor/assignments/AssignmentsClient.tsx', code);
