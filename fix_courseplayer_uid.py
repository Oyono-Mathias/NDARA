import re

with open('src/views/CoursePlayer.tsx', 'r') as f:
    content = f.read()

content = content.replace("if (!course || !isEnrolled) return;", "if (!course || !isEnrolled || !firebaseUser) return;")
content = content.replace("where('studentId', '==', firebaseUser?.uid)", "where('studentId', '==', firebaseUser.uid)")

with open('src/views/CoursePlayer.tsx', 'w') as f:
    f.write(content)
