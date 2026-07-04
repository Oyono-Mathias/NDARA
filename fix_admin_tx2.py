import re

with open('src/views/admin/AdminTransactions.tsx', 'r') as f:
    content = f.read()

content = content.replace("doc(collectionGroup(db, 'transactions'))", "doc(collection(db, 'transactions'))")

with open('src/views/admin/AdminTransactions.tsx', 'w') as f:
    f.write(content)
