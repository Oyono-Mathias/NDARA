import { useState, useEffect } from 'react';
import { doc, collection, onSnapshot, DocumentData, query, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase';

export function useFirestoreDocument<T = DocumentData>(collectionName: string, documentId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, collectionName, documentId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data() as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Erreur Firestore:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading, error };
}

export function useFirestoreCollection<T = DocumentData>(collectionName: string, queryConstraints?: QueryConstraint[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let colRef = collection(db, collectionName);
    let q = queryConstraints ? query(colRef, ...queryConstraints) : colRef;
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(`Erreur Firestore (${collectionName}):`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading, error };
}
