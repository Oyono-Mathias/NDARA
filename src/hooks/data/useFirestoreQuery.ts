import { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '../../firebase';
import { normalizeFirebaseError, AppError } from '../../utils/firebaseErrors';

export const useFirestoreQuery = <T>(collectionName: string, constraints: QueryConstraint[] = []) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchQuery = useCallback(async (activeConstraints = constraints) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, collectionName), ...activeConstraints);
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as unknown as T));
      setData(results);
    } catch (err) {
      setError(normalizeFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }, [collectionName, constraints]);

  useEffect(() => {
    let isMounted = true;
    const execute = async () => {
      try {
        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);
        if (isMounted) {
          const results = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as unknown as T));
          setData(results);
        }
      } catch (err) {
        if (isMounted) setError(normalizeFirebaseError(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    execute();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading, error, empty: data.length === 0 && !loading && !error, refetch: fetchQuery };
};
