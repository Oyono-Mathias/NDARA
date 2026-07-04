import { useState, useEffect } from 'react';
import { CoursesService, CategoriesService, FavoritesService, EnrollmentsService, ProgressService } from '../../services/db';
import { Course, Category } from '../../types/models';
import { where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

export function useCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCourses = CoursesService.subscribe(
      [where('status', '==', 'published'), orderBy('createdAt', 'desc')],
      (data) => setCourses(data)
    );

    const unsubCategories = CategoriesService.subscribe(
      [where('status', '==', 'active'), orderBy('order', 'asc')],
      (data) => setCategories(data)
    );

    setLoading(false);
    return () => {
      unsubCourses();
      unsubCategories();
    };
  }, []);

  return { courses, categories, loading };
}

export function useCourse(slug: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    const fetchCourse = async () => {
      const data = await CoursesService.getAll([where('slug', '==', slug), limit(1)]);
      if (data.length > 0) {
        setCourse(data[0]);
      }
      setLoading(false);
    };
    
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    if (!firebaseUser || !course) return;

    const unsubEnroll = EnrollmentsService.subscribe(
      [where('studentId', '==', firebaseUser.uid), where('courseId', '==', course.id)],
      (data) => {
        setIsEnrolled(data.length > 0 && data[0].status === 'active');
      }
    );

    const unsubFav = FavoritesService.subscribe(
      [where('userId', '==', firebaseUser.uid), where('entityId', '==', course.id)],
      (data) => {
        setIsFavorite(data.length > 0);
      }
    );

    return () => {
      unsubEnroll();
      unsubFav();
    };
  }, [firebaseUser, course]);

  const toggleFavorite = async () => {
    if (!firebaseUser || !course) return;
    const favs = await FavoritesService.getAll([where('userId', '==', firebaseUser.uid), where('entityId', '==', course.id)]);
    
    if (favs.length === 0) {
      await FavoritesService.create({ userId: firebaseUser.uid, entityId: course.id, entityType: 'course' } as any);
    } else {
      await FavoritesService.delete(favs[0].id, true); // Hard delete fav
    }
  };
  
  const enroll = async () => {
    if (!firebaseUser || !course || !course.isFree) return;
    const enrollments = await EnrollmentsService.getAll([where('studentId', '==', firebaseUser.uid), where('courseId', '==', course.id)]);
    
    if (enrollments.length === 0) {
      await EnrollmentsService.create({
        studentId: firebaseUser.uid,
        courseId: course.id,
        status: 'active',
        enrolledAt: Date.now()
      } as any);
    }
  };

  return { course, loading, isEnrolled, isFavorite, toggleFavorite, enroll };
}

export function useMyCourses() {
  const [courses, setCourses] = useState<(Course & { progress: number; completedLessons: number; isFavorite: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (!firebaseUser) return;
    
    // Subscribe to enrollments
    const unsub = EnrollmentsService.subscribe(
      [where('studentId', '==', firebaseUser.uid)],
      async (enrollments) => {
        if (enrollments.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        const enrolledCourseIds = enrollments.map(e => e.courseId);
        
        // Cannot use 'in' with > 10 items easily, let's fetch all courses and filter, or fetch individually
        const coursesData = await Promise.all(
          enrolledCourseIds.map(id => CoursesService.getById(id))
        );
        
        const validCourses = coursesData.filter(Boolean) as Course[];

        // Fetch progress for these courses
        const progresses = await Promise.all(
          validCourses.map(c => 
            ProgressService.getAll([where('studentId', '==', firebaseUser.uid), where('courseId', '==', c.id)])
          )
        );

        // Fetch favorites
        const favs = await FavoritesService.getAll([where('userId', '==', firebaseUser.uid)]);
        const favIds = new Set(favs.map(f => f.entityId));

        const enrichedCourses = validCourses.map((c, i) => {
          const completedLessons = progresses[i].filter(p => p.completed).length;
          const progress = c.totalLessons > 0 ? Math.round((completedLessons / c.totalLessons) * 100) : 0;
          return {
            ...c,
            progress,
            completedLessons,
            isFavorite: favIds.has(c.id)
          };
        });

        setCourses(enrichedCourses);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [firebaseUser]);

  return { courses, loading };
}
