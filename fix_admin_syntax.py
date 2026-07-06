import re

with open('src/views/admin/AdminTransactions.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    ") : (}",
    ") : ( <span className=\"text-[10px] font-bold text-slate-500\">{formatDate(p.createdAt)}</span> )}"
)

with open('src/views/admin/AdminTransactions.tsx', 'w') as f:
    f.write(content)
