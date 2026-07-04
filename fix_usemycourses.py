import re

with open('src/hooks/catalog/useCatalogClient.ts', 'r') as f:
    content = f.read()

# Replace hook definition
old_def = """export function useMyCourses() {
  const [courses, setCourses] = useState<(Course & { progress: number; completedLessons: number })[]>([]);"""

new_def = """export function useMyCourses() {
  const [courses, setCourses] = useState<(Course & { progress: number; completedLessons: number; isFavorite: boolean })[]>([]);"""

content = content.replace(old_def, new_def)

# Replace the inner logic
old_enrich = """        const enrichedCourses = validCourses.map((c, i) => {
          const completedLessons = progresses[i].filter(p => p.completed).length;
          const progress = c.totalLessons > 0 ? Math.round((completedLessons / c.totalLessons) * 100) : 0;
          return {
            ...c,
            progress,
            completedLessons
          };
        });"""

new_enrich = """        // Fetch favorites
        const favs = await import('../../services/db').then(m => m.FavoritesService.getAll([where('userId', '==', firebaseUser.uid)]));
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
        });"""

content = content.replace(old_enrich, new_enrich)

with open('src/hooks/catalog/useCatalogClient.ts', 'w') as f:
    f.write(content)
