with open('src/lib/walletProcessor.ts', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "return {" in line and "success: true," in lines[i+1]:
        # insert here
        logic = '''
    // 8. Create Enrollment
    const enrollmentRef = doc(collection(serverDb, 'enrollments'));
    transaction.set(enrollmentRef, {
      studentId: studentId,
      courseId: courseId,
      enrolledAt: creationTime.toISOString(),
      progress: 0,
      instructorId: sellerId
    });
'''
        lines.insert(i, logic)
        break

with open('src/lib/walletProcessor.ts', 'w') as f:
    f.writelines(lines)
