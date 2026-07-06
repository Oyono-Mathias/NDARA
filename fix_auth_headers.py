import re

files = [
    'src/views/Checkout.tsx',
    'src/views/EbookMarket.tsx',
    'src/views/EbookDetail.tsx',
    'src/views/TemplateMarket.tsx',
    'src/views/Ambassador.tsx'
]

for file_path in files:
    try:
        with open(file_path, 'r') as f:
            content = f.read()

        # Check if auth needs to be imported
        if 'auth.currentUser' not in content and 'import { auth }' not in content:
            if 'import { db } from "../firebase";' in content:
                content = content.replace('import { db } from "../firebase";', 'import { db, auth } from "../firebase";')
            elif 'import { db } from "../../firebase";' in content:
                content = content.replace('import { db } from "../../firebase";', 'import { db, auth } from "../../firebase";')

        # Add Authorization header to /api/wallet/purchase
        if 'headers: { \'Content-Type\': \'application/json\' }' in content:
            content = content.replace(
                "headers: { 'Content-Type': 'application/json' }",
                "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}` }"
            )
            
        # Add Authorization header to /api/wallet/request-payout
        if 'headers: { "Content-Type": "application/json" }' in content:
            content = content.replace(
                'headers: { "Content-Type": "application/json" }',
                'headers: { "Content-Type": "application/json", "Authorization": `Bearer ${await auth.currentUser?.getIdToken()}` }'
            )

        with open(file_path, 'w') as f:
            f.write(content)
    except Exception as e:
        print(e)
