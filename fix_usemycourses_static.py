import re
with open('src/hooks/catalog/useCatalogClient.ts', 'r') as f:
    content = f.read()

# Fix imports at the top
content = content.replace(
    "import { CoursesService, CategoriesService, FavoritesService, EnrollmentsService } from '../../services/db';",
    "import { CoursesService, CategoriesService, FavoritesService, EnrollmentsService, ProgressService } from '../../services/db';"
)

# Fix dynamic imports
content = content.replace(
    """        const progresses = await Promise.all(
          validCourses.map(c => 
            import('../../services/db').then(m => 
              m.ProgressService.getAll([where('studentId', '==', firebaseUser.uid), where('courseId', '==', c.id)])
            )
          )
        );""",
    """        const progresses = await Promise.all(
          validCourses.map(c => 
            ProgressService.getAll([where('studentId', '==', firebaseUser.uid), where('courseId', '==', c.id)])
          )
        );"""
)

content = content.replace(
    """        const favs = await import('../../services/db').then(m => m.FavoritesService.getAll([where('userId', '==', firebaseUser.uid)]));""",
    """        const favs = await FavoritesService.getAll([where('userId', '==', firebaseUser.uid)]);"""
)

with open('src/hooks/catalog/useCatalogClient.ts', 'w') as f:
    f.write(content)
