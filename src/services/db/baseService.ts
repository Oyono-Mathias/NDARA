import { db } from '../../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  QueryConstraint,
  serverTimestamp,
  DocumentData,
  WithFieldValue,
  PartialWithFieldValue,
  DocumentSnapshot
} from 'firebase/firestore';

/**
 * Service générique de base de données Firestore.
 * Conçu pour unifier la logique d'accès, de conversion et d'horodatage.
 */
export class BaseDBService<T extends { id?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollectionRef() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  protected mapDocToData(docSnap: DocumentSnapshot<DocumentData, DocumentData>): T | null {
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as T;
  }

  async getById(id: string): Promise<T | null> {
    const docSnap = await getDoc(this.getDocRef(id));
    return this.mapDocToData(docSnap);
  }

  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(this.getCollectionRef(), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as T));
  }

  async create(data: Omit<T, 'id'>, customId?: string): Promise<string> {
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    if (customId) {
      await setDoc(this.getDocRef(customId), dataWithTimestamp as WithFieldValue<DocumentData>);
      return customId;
    } else {
      const newDocRef = doc(this.getCollectionRef());
      await setDoc(newDocRef, dataWithTimestamp as WithFieldValue<DocumentData>);
      return newDocRef.id;
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(this.getDocRef(id), dataWithTimestamp as PartialWithFieldValue<DocumentData>);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.getDocRef(id));
  }
}
