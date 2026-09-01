import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { normalizeFirebaseError, AppError } from '../../utils/firebaseErrors';

export const useFirestoreDocument = <T>(collectionName: string, documentId: string | null) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!documentId) {
        if (isMounted) setData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (isMounted) {
          if (docSnap.exists()) {
            setData({ id: docSnap.id, ...docSnap.data() } as unknown as T);
          } else {
            setData(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(normalizeFirebaseError(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [collectionName, documentId]);

  return { data, loading, error, empty: !data && !loading && !error };
};
