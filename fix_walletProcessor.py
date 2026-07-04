import re

with open('src/lib/walletProcessor.ts', 'r') as f:
    content = f.read()

# Replace the incorrect admin SDK syntax with Client SDK syntax inside a client transaction
new_enroll_check = """
    // 0. Check if already enrolled
    const enrollmentsQuery = query(collection(serverDb, 'enrollments'), where('studentId', '==', studentId), where('courseId', '==', courseId));
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    if (!enrollmentsSnapshot.empty) {
      throw new Error('Vous êtes déjà inscrit à cette formation.');
    }
"""

content = content.replace("""    // 0. Check if already enrolled
    const enrollmentsSnapshot = await serverDb.collection('enrollments').where('studentId', '==', studentId).where('courseId', '==', courseId).get();
    if (!enrollmentsSnapshot.empty) {
      throw new Error('Vous êtes déjà inscrit à cette formation.');
    }""", new_enroll_check)

new_enroll_creation = """
    // 8. Create Enrollment
    const enrollmentRef = doc(collection(serverDb, 'enrollments'));
    transaction.set(enrollmentRef, {
      id: enrollmentRef.id,
      studentId,
      courseId,
      status: 'active',
      enrolledAt: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
"""

content = content.replace("""    // 8. Create Enrollment
    const enrollmentRef = serverDb.collection('enrollments').doc();
    transaction.set(enrollmentRef, {
      id: enrollmentRef.id,
      studentId,
      courseId,
      status: 'active',
      enrolledAt: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });""", new_enroll_creation)

with open('src/lib/walletProcessor.ts', 'w') as f:
    f.write(content)
