import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace all standard view imports with lazy imports, except core layout components
# I will just create a script that reads all imports and converts them

lines = content.split('\n')
new_lines = []
imports_to_lazy = []

for line in lines:
    if line.startswith('import ') and 'from "./views/' in line:
        # Match 'import { Comp1, Comp2 } from ...' or 'import Comp1 from ...'
        match = re.match(r'import\s+\{([^}]+)\}\s+from\s+["\'](\./views/[^"\']+)["\'];', line)
        if match:
            comps = [c.strip() for c in match.group(1).split(',')]
            path = match.group(2)
            for comp in comps:
                imports_to_lazy.append((comp, path, False))
            continue
            
        match = re.match(r'import\s+([A-Za-z0-9_]+)\s+from\s+["\'](\./views/[^"\']+)["\'];', line)
        if match:
            comp = match.group(1)
            path = match.group(2)
            imports_to_lazy.append((comp, path, True))
            continue
    new_lines.append(line)

content = '\n'.join(new_lines)

lazy_declarations = ""
for comp, path, is_default in imports_to_lazy:
    if is_default:
        lazy_declarations += f"const {comp} = React.lazy(() => import('{path}'));\n"
    else:
        lazy_declarations += f"const {comp} = React.lazy(() => import('{path}').then(module => ({{ default: module.{comp} }})));\n"

# add React if not there
if "import React" not in content:
    content = "import React, { Suspense } from 'react';\n" + content
else:
    content = content.replace("import React", "import React, { Suspense }")

# Add Suspense wrap around <Routes>
content = content.replace("<Routes>", "<Suspense fallback={<div className=\"h-screen flex items-center justify-center\"><div className=\"animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full\"></div></div>}>\n      <Routes>")
content = content.replace("</Routes>", "</Routes>\n      </Suspense>")

# inject lazy declarations after imports
last_import = 0
lines = content.split('\n')
for i, line in enumerate(lines):
    if line.startswith('import '):
        last_import = i

lines.insert(last_import + 1, lazy_declarations)

with open('src/App.tsx', 'w') as f:
    f.write('\n'.join(lines))
