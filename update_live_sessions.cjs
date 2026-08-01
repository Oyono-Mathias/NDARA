const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'views', 'instructor', 'InstructorLiveSessions.tsx');
let code = fs.readFileSync(file, 'utf8');

// 1. Add email logic inside onSuccess
const emailLogic = `
        // Save to Firestore (already here)
        await addDoc(collection(db, 'live_sessions'), {
          instructorId: auth.currentUser?.uid,
          courseId: newSession.courseId,
          title: newSession.title,
          description: newSession.description,
          scheduledAt: newSession.scheduledAt,
          meetingUri: meetingUri,
          createdAt: serverTimestamp()
        });

        // NOTIFY STUDENTS VIA GMAIL API
        try {
          const qStudents = query(collection(db, 'enrollments'), where('courseId', '==', newSession.courseId));
          const snapEnrols = await getDocs(qStudents);
          
          if (!snapEnrols.empty) {
            const courseTitle = courses.find(c => c.id === newSession.courseId)?.title || "Formation";
            const dateStr = new Date(newSession.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
            
            for (const enrol of snapEnrols.docs) {
              const studentId = enrol.data().studentId;
              const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', studentId)));
              if (!userSnap.empty) {
                const userEmail = userSnap.docs[0].data().email;
                if (userEmail) {
                  const subject = \`[NDARA] Nouvelle Session Live : \${newSession.title}\`;
                  const body = \`
                    <h2>Nouvelle session live pour votre formation "\${courseTitle}"</h2>
                    <p>Bonjour,</p>
                    <p>Votre formateur a programmé une nouvelle session live :</p>
                    <ul>
                      <li><strong>Titre :</strong> \${newSession.title}</li>
                      <li><strong>Date :</strong> \${dateStr}</li>
                      <li><strong>Lien Google Meet :</strong> <a href="\${meetingUri}">\${meetingUri}</a></li>
                    </ul>
                    <p>\${newSession.description}</p>
                    <p>À très bientôt sur NDARA !</p>
                  \`;
                  
                  const emailRaw = [
                    \`To: \${userEmail}\`,
                    'Content-Type: text/html; charset=utf-8',
                    'MIME-Version: 1.0',
                    \`Subject: \${subject}\`,
                    '',
                    body,
                  ].join('\\n');
                  
                  const encodedEmail = btoa(unescape(encodeURIComponent(emailRaw))).replace(/\\+/g, '-').replace(/\\//g, '_');
                  
                  await fetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send', {
                    method: 'POST',
                    headers: {
                      'Authorization': \`Bearer \${tokenResponse.access_token}\`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ raw: encodedEmail })
                  });
                }
              }
            }
          }
        } catch(e) {
          console.error("Failed to send emails", e);
        }
`;

if (!code.includes('gmail.googleapis.com')) {
    code = code.replace(
        `        // Save to Firestore
        await addDoc(collection(db, 'live_sessions'), {
          instructorId: auth.currentUser?.uid,
          courseId: newSession.courseId,
          title: newSession.title,
          description: newSession.description,
          scheduledAt: newSession.scheduledAt,
          meetingUri: meetingUri,
          createdAt: serverTimestamp()
        });`,
        emailLogic
    );
    
    code = code.replace(
        "scope: 'https://www.googleapis.com/auth/meetings.space.created',",
        "scope: 'https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/gmail.send',"
    );
    fs.writeFileSync(file, code);
    console.log("InstructorLiveSessions updated with Gmail notification");
} else {
    console.log("Already updated");
}
