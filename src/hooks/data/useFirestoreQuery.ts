import { useState, useEffect } from 'react';
import { QueryConstraint } from 'firebase/firestore';
import { BaseService } from '../../services/db/baseService';
import { BaseModel } from '../../types/models';

export function useFirestoreQuery<T extends BaseModel>(
  service: BaseService<T>,
  constraints: QueryConstraint[] = [],
  includeDeleted = false
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = service.subscribe(
      constraints,
      (fetchedData) => {
        setData(fetchedData);
        setLoading(false);
      },
      includeDeleted
    );
    return () => unsubscribe();
  }, [service]); // Assuming constraints are memoized by caller

  return { data, loading, error };
}
