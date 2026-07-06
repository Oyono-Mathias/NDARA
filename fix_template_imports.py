import re

with open('src/views/TemplateMarket.tsx', 'r') as f:
    content = f.read()

# Add getDocs to the imports from firebase/firestore
content = re.sub(r'(import \{[^}]*?)(collection)([^}]*?\} from "firebase/firestore";)', r'\1\2, getDocs, query, where\3', content)

with open('src/views/TemplateMarket.tsx', 'w') as f:
    f.write(content)
