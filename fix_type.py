import re

with open('src/views/instructor/InstructorWealth.tsx', 'r') as f:
    content = f.read()

content = content.replace("const sales = txs.filter(t => t.amount > 0", "const sales = txs.filter((t: any) => t.amount > 0")

with open('src/views/instructor/InstructorWealth.tsx', 'w') as f:
    f.write(content)
