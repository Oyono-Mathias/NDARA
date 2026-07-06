import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add import if not present
if "import { startCronJobs }" not in content:
    content = content.replace("import express from 'express';", "import express from 'express';\nimport { startCronJobs } from './src/jobs/cronTasks';")

# Add function call if not present
if "startCronJobs();" not in content:
    content = content.replace("startServer();", "startServer();\nstartCronJobs();")

with open('server.ts', 'w') as f:
    f.write(content)
