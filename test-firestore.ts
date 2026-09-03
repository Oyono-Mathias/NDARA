import { db } from './src/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

async function run() {
  try {
    const rc = await getCountFromServer(query(collection(db, 'reviews'), where('isApproved', '==', true)));
    console.log("Reviews:", rc.data().count);
    const cc = await getCountFromServer(collection(db, 'categories'));
    console.log("Categories:", cc.data().count);
  } catch(e) {
    console.error(e);
  }
}
run();
