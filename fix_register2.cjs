const fs = require('fs');
let code = fs.readFileSync('src/views/auth/RegisterView.tsx', 'utf8');
code = code.replace("import { auth } from '../../firebase';", "import { auth, db } from '../../firebase';\nimport { collection, query, where, getDocs, limit, runTransaction, doc, getDoc, serverTimestamp, increment } from 'firebase/firestore';");
fs.writeFileSync('src/views/auth/RegisterView.tsx', code);
