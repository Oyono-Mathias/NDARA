const fs = require('fs');
let code = fs.readFileSync('src/lib/walletProcessor.ts', 'utf8');

code = code.replace(/import \{ serverDb \} from '\.\.\/firebaseServer';/g, "import { adminDb as serverDb } from './firebaseAdmin';");
code = code.replace(/import \{ doc, runTransaction, collection, addDoc, getDocs, query, where, Timestamp \} from 'firebase\/firestore';/g, "import { FieldValue, Timestamp } from 'firebase-admin/firestore';");

code = code.replace(/doc\(serverDb, '([^']+)', ([a-zA-Z0-9_]+)\)/g, "serverDb.collection('$1').doc($2)");
code = code.replace(/doc\(serverDb, '([^']+)', ([a-zA-Z0-9_]+), '([^']+)', ([^)]+)\)/g, "serverDb.collection('$1').doc($2).collection('$3').doc($4)");
code = code.replace(/doc\(collection\(serverDb, '([^']+)', ([a-zA-Z0-9_]+), '([^']+)'\)\)/g, "serverDb.collection('$1').doc($2).collection('$3').doc()");
code = code.replace(/doc\(collection\(serverDb, '([^']+)'\)\)/g, "serverDb.collection('$1').doc()");
code = code.replace(/collection\(serverDb, '([^']+)', ([a-zA-Z0-9_]+), '([^']+)'\)/g, "serverDb.collection('$1').doc($2).collection('$3')");
code = code.replace(/collection\(serverDb, '([^']+)'\)/g, "serverDb.collection('$1')");
code = code.replace(/addDoc\((serverDb\.collection\([^)]+\)), (.*?)\)/g, "$1.add($2)");

code = code.replace(/runTransaction\(serverDb, async \(transaction\) =>/g, "serverDb.runTransaction(async (transaction) =>");

code = code.replace(/query\((serverDb\.collection\([^)]+\)), where\('([^']+)', '==', ([^)]+)\), where\('([^']+)', '==', ([^)]+)\)\)/g, "$1.where('$2', '==', $3).where('$4', '==', $5)");
code = code.replace(/query\((serverDb\.collection\([^)]+\)), where\('([^']+)', '==', ([^)]+)\)\)/g, "$1.where('$2', '==', $3)");

code = code.replace(/getDocs\(([^)]+)\)/g, "$1.get()");
code = code.replace(/serverTimestamp\(\)/g, "FieldValue.serverTimestamp()");

fs.writeFileSync('src/lib/walletProcessor.ts', code);
