import re

with open('src/lib/walletProcessor.ts', 'r') as f:
    content = f.read()

enrollment_logic = """
    // 8. Create Enrollment
    const enrollmentRef = doc(collection(serverDb, 'enrollments'));
    transaction.set(enrollmentRef, {
      studentId: studentId,
      courseId: courseId,
      enrolledAt: creationTime.toISOString(),
      progress: 0,
      instructorId: sellerId
    });

    return { 
"""

content = content.replace("    return { \n       success: true,", enrollment_logic + "       success: true,")

with open('src/lib/walletProcessor.ts', 'w') as f:
    f.write(content)
