with open('server.ts', 'r') as f:
    content = f.read()

if "import { startCronJobs }" not in content:
    content = content.replace("import express from \"express\";", "import express from \"express\";\nimport { startCronJobs } from \"./src/jobs/cronTasks\";")

with open('server.ts', 'w') as f:
    f.write(content)
