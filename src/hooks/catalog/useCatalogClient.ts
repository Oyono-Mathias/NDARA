import { useFirestoreQuery } from '../data';
import { QueryConstraint, where } from 'firebase/firestore';
import { useMemo } from 'react';

export interface ClientCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: string;
  instructorId: string;
  price?: number;
  isPublished: boolean;
  duration?: string;
}

export const useCatalogClient = (categoryId?: string) => {
  const constraints: QueryConstraint[] = useMemo(() => {
    const cons = [where('isPublished', '==', true)];
    if (categoryId) {
      cons.push(where('category', '==', categoryId));
    }
    return cons;
  }, [categoryId]);

  const { data, loading, error, empty, refetch } = useFirestoreQuery<ClientCourse>('courses', constraints);

  return { courses: data, loading, error, empty, refetch };
};
