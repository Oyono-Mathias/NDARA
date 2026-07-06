with open('server.ts', 'r') as f:
    content = f.read()

import re

# Add import if missing
if "import { adminDb }" not in content:
    content = content.replace("import { startCronJobs }", "import { startCronJobs } from \"./src/jobs/cronTasks\";\nimport { adminDb } from \"./src/lib/firebaseAdmin\";\nimport { startCronJobs }")

# Replace the require
content = re.sub(
    r'try \{\s*const \{ adminDb \} = require\([^\)]+\);\s*adminDb\.collection',
    r'try {\n                adminDb.collection',
    content
)

# Also remove TODO
content = content.replace("// TODO: Ideally we should log to Firestore audit_logs asynchronously\n", "")

with open('server.ts', 'w') as f:
    f.write(content)
