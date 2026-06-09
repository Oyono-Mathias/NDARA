import { db } from './src/firebase.js';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

async function testFetch() {
  const auth = getAuth();
  // Using user credentials provided in the request
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'oyonomathias@gmail.com', 'password123'); // Usually default dev password
    const uid = userCredential.user.uid;
    console.log("Logged in as", uid);

    const enrollmentsRef = collection(db, 'enrollments');
    const totalStudentsSnap = await getCountFromServer(
        query(enrollmentsRef, where('instructorId', '==', uid))
    );
    console.log("Enrollments count:", totalStudentsSnap.data().count);
    
  } catch (e) {
    console.error("Failed:", e);
  }
}
testFetch();
