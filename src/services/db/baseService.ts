import { db } from '../../firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, QueryConstraint, onSnapshot, DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions,
  startAfter, limit, where
} from 'firebase/firestore';
import { BaseModel } from '../../types/models';

export function createConverter<T extends BaseModel>(): FirestoreDataConverter<T> {
  return {
    toFirestore(modelObject: any): DocumentData {
      const data = { ...modelObject };
      delete data.id;
      return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      const data = snapshot.data(options);
      return { id: snapshot.id, ...data } as T;
    }
  };
}

export class BaseService<T extends BaseModel> {
  protected collectionName: string;
  protected converter: FirestoreDataConverter<T>;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.converter = createConverter<T>();
  }

  protected getCollectionRef() {
    return collection(db, this.collectionName).withConverter(this.converter);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id).withConverter(this.converter);
  }

  async getById(id: string): Promise<T | null> {
    const docSnap = await getDoc(this.getDocRef(id));
    return docSnap.exists() ? docSnap.data() : null;
  }

  async getAll(constraints: QueryConstraint[] = [], includeDeleted = false): Promise<T[]> {
    let finalConstraints = [...constraints];
    if (!includeDeleted) {
        finalConstraints.push(where('deletedAt', '==', null));
    }
    const q = query(this.getCollectionRef(), ...finalConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }
  
  async getPaginated(
    constraints: QueryConstraint[] = [], 
    pageSize: number = 10, 
    lastDoc?: QueryDocumentSnapshot<T>,
    includeDeleted = false
  ) {
      let finalConstraints = [...constraints];
      if (!includeDeleted) {
          finalConstraints.push(where('deletedAt', '==', null));
      }
      finalConstraints.push(limit(pageSize));
      if (lastDoc) {
          finalConstraints.push(startAfter(lastDoc));
      }
      
      const q = query(this.getCollectionRef(), ...finalConstraints);
      const querySnapshot = await getDocs(q);
      
      return {
          data: querySnapshot.docs.map(doc => doc.data()),
          lastDoc: querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : undefined
      };
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, customId?: string): Promise<string> {
    const docRef = customId ? this.getDocRef(customId) : doc(this.getCollectionRef());
    const now = Date.now();
    await setDoc(docRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
        deletedAt: null
    } as any);
    return docRef.id;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = this.getDocRef(id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now()
    } as any);
  }

  async delete(id: string, hard: boolean = false): Promise<void> {
    const docRef = this.getDocRef(id);
    if (hard) {
        await deleteDoc(docRef);
    } else {
        await updateDoc(docRef, { deletedAt: Date.now() } as any);
    }
  }

  subscribe(constraints: QueryConstraint[], callback: (data: T[]) => void, includeDeleted = false) {
    let finalConstraints = [...constraints];
    if (!includeDeleted) {
        finalConstraints.push(where('deletedAt', '==', null));
    }
    const q = query(this.getCollectionRef(), ...finalConstraints);
    return onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => doc.data());
      callback(results);
    });
  }
  
  subscribeToDoc(id: string, callback: (data: T | null) => void) {
      return onSnapshot(this.getDocRef(id), (docSnap) => {
          callback(docSnap.exists() ? docSnap.data() : null);
      });
  }
}
