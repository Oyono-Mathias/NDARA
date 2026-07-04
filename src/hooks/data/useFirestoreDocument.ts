import { useState, useEffect } from 'react';
import { BaseService } from '../../services/db/baseService';
import { BaseModel } from '../../types/models';

export function useFirestoreDocument<T extends BaseModel>(
  service: BaseService<T>,
  id: string | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
        setData(null);
        setLoading(false);
        return;
    }

    setLoading(true);
    const unsubscribe = service.subscribeToDoc(id, (fetchedData) => {
        setData(fetchedData);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [service, id]);

  return { data, loading, error };
}
