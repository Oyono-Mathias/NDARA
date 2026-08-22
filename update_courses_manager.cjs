const fs = require('fs');
let file = fs.readFileSync('src/views/admin/catalogue/CoursesManager.tsx', 'utf8');

const newFilters = `
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const filteredCourses = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ? c.status !== 'archived' : c.status === statusFilter;
    return matchSearch && matchStatus;
  });
`;

file = file.replace(/const \[search, setSearch\] = useState\(''\);\s*if \(loading\) \{[\s\S]*?c\.slug\.toLowerCase\(\)\.includes\(search\.toLowerCase\(\)\)\s*\);/g, newFilters);

const filterUI = `
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex-1 min-w-[300px] flex gap-4">
          <input 
            type="text" 
            placeholder="Rechercher une formation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none"
          />
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none"
          >
            <option value="all">Toutes (sauf archivées)</option>
            <option value="pending_review">En attente (Modération)</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
            <option value="rejected">Rejetées</option>
            <option value="archived">Archivées</option>
          </select>
        </div>
`;

file = file.replace(/<div className="flex justify-between items-center">[\s\S]*?<div className="flex-1 max-w-md">[\s\S]*?<\/div>/, filterUI);

// Update link to moderate
file = file.replace(/<button onClick=\{\(\) => navigate\(\`\/admin\/catalog\/courses\/\$\{course\.id\}\/builder\`\)\}/g, `<button onClick={() => navigate(\`/admin/catalog/courses/\${course.id}/review\`)}`);
file = file.replace(/<Edit2 className="w-4 h-4" \/>/g, `<BookOpen className="w-4 h-4" />`);


fs.writeFileSync('src/views/admin/catalogue/CoursesManager.tsx', file);
