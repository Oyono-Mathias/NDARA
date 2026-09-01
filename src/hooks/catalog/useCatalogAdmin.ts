import { useFirestoreQuery } from '../data';

export interface AdminCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  instructorId: string;
  isPublished: boolean;
  enrollmentCount?: number;
  thumbnailUrl?: string;
  price?: number;
}

export const useCatalogAdmin = () => {
  // L'administrateur peut voir tous les cours, y compris les non-publiés.
  // La sécurité réelle est gérée dans firestore.rules
  const { data, loading, error, empty, refetch } = useFirestoreQuery<AdminCourse>('courses', []);

  return { courses: data, loading, error, empty, refetch };
};
