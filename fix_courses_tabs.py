import re

with open('src/views/Courses.tsx', 'r') as f:
    content = f.read()

old_tabs = """const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'inprogress', label: 'En cours' },
  { id: 'completed', label: 'Terminés' }
];"""

new_tabs = """const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'inprogress', label: 'En cours' },
  { id: 'completed', label: 'Terminés' },
  { id: 'favorites', label: 'Favoris' }
];"""

content = content.replace(old_tabs, new_tabs)

# Need to handle favorites in filteredResults, but useMyCourses doesn't fetch Favorites yet...
# Actually we can skip favorite filtering inside Courses, or just leave it out to avoid overcomplicating,
# But the user asked for "Recherche, Filtres, Tri, Favoris" in "Mes Cours".
# Let's add favorites to useMyCourses hook.
