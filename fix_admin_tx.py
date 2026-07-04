import re

with open('src/views/admin/AdminTransactions.tsx', 'r') as f:
    content = f.read()

content = content.replace("collection(db, 'transactions')", "collectionGroup(db, 'transactions')")
content = content.replace("orderBy('createdAt'", "orderBy('timestamp'")
content = content.replace("import { collection, query", "import { collection, collectionGroup, query")

with open('src/views/admin/AdminTransactions.tsx', 'w') as f:
    f.write(content)
