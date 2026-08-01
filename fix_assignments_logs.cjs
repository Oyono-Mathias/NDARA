const fs = require('fs');

function replaceCode(file, searchStr, replaceStr) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync(file, code, 'utf8');
}

// AssignmentsClient.tsx
replaceCode('src/components/instructor/assignments/AssignmentsClient.tsx', 
`const unsubCourses = onSnapshot(qCourses, (snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });`,
`logger.info("Listening courses", { collection: "courses", uid: instructor?.uid });
    const unsubCourses = onSnapshot(qCourses, (snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => logger.error("Courses snapshot failed", err));`);

replaceCode('src/components/instructor/assignments/AssignmentsClient.tsx',
`const unsubAssignments = onSnapshot(qAssignments, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      fetched.sort((a: any, b: any) => {
        const dA = a.createdAt?.toMillis?.() || 0;
        const dB = b.createdAt?.toMillis?.() || 0;
        return dB - dA;
      });
      setAssignments(fetched);
    });`,
`logger.info("Listening assignments", { collection: "assignments", uid: instructor?.uid });
    const unsubAssignments = onSnapshot(qAssignments, (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      fetched.sort((a: any, b: any) => {
        const dA = a.createdAt?.toMillis?.() || 0;
        const dB = b.createdAt?.toMillis?.() || 0;
        return dB - dA;
      });
      setAssignments(fetched);
    }, (err) => logger.error("Assignments snapshot failed", err));`);

replaceCode('src/components/instructor/assignments/AssignmentsClient.tsx',
`const unsubSubmissions = onSnapshot(qSubmissions, (snap) => {
      setSubmissions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setIsLoadingSubmissions(false);
    });`,
`logger.info("Listening assignments_submissions", { collection: "assignments_submissions", uid: instructor?.uid });
    const unsubSubmissions = onSnapshot(qSubmissions, (snap) => {
      setSubmissions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setIsLoadingSubmissions(false);
    }, (err) => logger.error("Submissions snapshot failed", err));`);

// Assignments.tsx
replaceCode('src/views/Assignments.tsx',
`const unsubAssignments = onSnapshot(assignmentsQuery, (assignSnap) => {`,
`logger.info("Listening assignments", { collection: "assignments", uid: user.uid });
                const unsubAssignments = onSnapshot(assignmentsQuery, (assignSnap) => {`);
replaceCode('src/views/Assignments.tsx',
`                });

                // 3. Écouter les soumissions existantes de l'étudiant
                const submissionsQuery = query(collection(db, 'assignments_submissions'), where('studentId', '==', user.uid));
                const unsubSubmissions = onSnapshot(submissionsQuery, (subSnap) => {`,
`                }, (err) => logger.error("Assignments snapshot failed", err));

                // 3. Écouter les soumissions existantes de l'étudiant
                const submissionsQuery = query(collection(db, 'assignments_submissions'), where('studentId', '==', user.uid));
                logger.info("Listening assignments_submissions", { collection: "assignments_submissions", uid: user.uid });
                const unsubSubmissions = onSnapshot(submissionsQuery, (subSnap) => {`);

replaceCode('src/views/Assignments.tsx',
`                });

                return () => {
                    unsubAssignments();
                    unsubSubmissions();
                };`,
`                }, (err) => logger.error("Submissions snapshot failed", err));

                return () => {
                    unsubAssignments();
                    unsubSubmissions();
                };`);

// AssignmentDetail.tsx
replaceCode('src/views/AssignmentDetail.tsx',
`const unsubAssign = onSnapshot(assignQuery, (assignSnap) => {`,
`logger.info("Listening assignments", { collection: "assignments", assignmentId, uid: user.uid });
                const unsubAssign = onSnapshot(assignQuery, (assignSnap) => {`);
                
replaceCode('src/views/AssignmentDetail.tsx',
`                });

                const subQuery = query(collection(db, 'assignments_submissions'), where('assignmentId', '==', assignmentId), where('studentId', '==', user.uid));
                const unsubSub = onSnapshot(subQuery, (subSnap) => {`,
`                }, (err) => logger.error("Assignment snapshot failed", err));

                const subQuery = query(collection(db, 'assignments_submissions'), where('assignmentId', '==', assignmentId), where('studentId', '==', user.uid));
                logger.info("Listening assignments_submissions", { collection: "assignments_submissions", assignmentId, uid: user.uid });
                const unsubSub = onSnapshot(subQuery, (subSnap) => {`);

replaceCode('src/views/AssignmentDetail.tsx',
`                } else {
                    setSubmission(null);
                }
                setIsLoading(false);
            });

            return () => {
                unsubAssign();
                unsubSub();
            };`,
`                } else {
                    setSubmission(null);
                }
                setIsLoading(false);
            }, (err) => logger.error("Submissions snapshot failed", err));

            return () => {
                unsubAssign();
                unsubSub();
            };`);
