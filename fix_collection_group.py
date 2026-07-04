import re
with open('src/views/admin/AdminMembers.tsx', 'r') as f:
    content = f.read()

content = content.replace("writeBatch, orderBy } from 'firebase/firestore';", "writeBatch, orderBy, collectionGroup } from 'firebase/firestore';")

with open('src/views/admin/AdminMembers.tsx', 'w') as f:
    f.write(content)
