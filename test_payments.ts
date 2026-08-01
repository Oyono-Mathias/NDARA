import { getFirestore, query, collection, where, getDocs, getAggregateFromServer, sum } from 'firebase/firestore';
import { db, auth } from './src/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

async function main() {
  await signInWithEmailAndPassword(auth, 'oyonomathias@gmail.com', 'password123'); // assuming password is password123, or use a known one. Or I can test with admin-sdk.
}
