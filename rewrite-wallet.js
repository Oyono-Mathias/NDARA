const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

// Replace imports
code = code.replace(/import \{ serverDb \} from '\.\.\/firebaseServer';/, "import { adminDb as serverDb } from './firebaseAdmin';");
code = code.replace(/import \{[^}]*\} from 'firebase\/firestore';/, "import { FieldValue, Timestamp } from 'firebase-admin/firestore';");

// Convert doc(serverDb, 'col', 'id') -> serverDb.collection('col').doc('id')
code = code.replace(/doc\(serverDb, '([^']+)', ([^,)]+)\)/g, "serverDb.collection('$1').doc($2)");
code = code.replace(/doc\(serverDb, '([^']+)', ([^,]+), '([^']+)', ([^,)]+)\)/g, "serverDb.collection('$1').doc($2).collection('$3').doc($4)");

// Convert collection(serverDb, 'col') -> serverDb.collection('col')
code = code.replace(/collection\(serverDb, '([^']+)'\)/g, "serverDb.collection('$1')");
code = code.replace(/collection\(serverDb, '([^']+)', ([^,]+), '([^']+)'\)/g, "serverDb.collection('$1').doc($2).collection('$3')");

// doc(collection(...)) -> collection(...).doc()
code = code.replace(/doc\((serverDb\.collection\([^)]+\))\)/g, "$1.doc()");

// addDoc(collection(...), data) -> collection(...).add(data)
code = code.replace(/addDoc\((serverDb\.collection\([^)]+\)), (.*?)\)/g, "$1.add($2)");

// runTransaction(serverDb, async (transaction) => -> serverDb.runTransaction(async (transaction) =>
code = code.replace(/runTransaction\(serverDb, async \(transaction\) =>/g, "serverDb.runTransaction(async (transaction) =>");

// query(collection(...), where(...), where(...)) -> collection(...).where(...).where(...)
// This is tricky with regex. Let's handle the specific ones in walletProcessor.ts
code = code.replace(/query\((serverDb\.collection\([^)]+\)), where\('([^']+)', '==', ([^)]+)\)\)/g, "$1.where('$2', '==', $3)");
code = code.replace(/query\((serverDb\.collection\([^)]+\)), where\('([^']+)', '==', ([^)]+)\), where\('([^']+)', '==', ([^)]+)\)\)/g, "$1.where('$2', '==', $3).where('$4', '==', $5)");
code = code.replace(/query\((serverDb\.collection\([^)]+\)), orderBy\('([^']+)', '([^']+)'\), limit\(([^)]+)\)\)/g, "$1.orderBy('$2', '$3').limit($4)");

// getDocs(q) -> q.get()
code = code.replace(/getDocs\(([^)]+)\)/g, "$1.get()");

// serverTimestamp() -> FieldValue.serverTimestamp()
code = code.replace(/serverTimestamp\(\)/g, "FieldValue.serverTimestamp()");

// snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) -> snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) (Admin SDK is same)

fs.writeFileSync('src/lib/walletProcessor.ts', code);
