with open('src/hooks/catalog/useCatalogClient.ts', 'r') as f:
    content = f.read()

new_hooks = """
export function useMyCourses() {
  const [courses, setCourses] = useState<(Course & { progress: number; completedLessons: number })[]>([]);
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
            import('../../services/db').then(m => 
              m.ProgressService.getAll([where('studentId', '==', firebaseUser.uid), where('courseId', '==', c.id)])
            )
          )
        );

        const enrichedCourses = validCourses.map((c, i) => {
          const completedLessons = progresses[i].filter(p => p.completed).length;
          const progress = c.totalLessons > 0 ? Math.round((completedLessons / c.totalLessons) * 100) : 0;
          return {
            ...c,
            progress,
            completedLessons
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
"""

if "export function useMyCourses()" not in content:
    content += new_hooks

with open('src/hooks/catalog/useCatalogClient.ts', 'w') as f:
    f.write(content)
