const fs = require('fs');
let code = fs.readFileSync('src/views/admin/catalogue/AdminCatalogView.tsx', 'utf8');

code = code.replace(
  "import { TouchArea } from '../../../components/ui/TouchArea';",
  "import { TouchArea } from '../../../components/ui/TouchArea';\nimport { EbooksManager } from './EbooksManager';"
);

code = code.replace(
  "import { FolderTree, BookOpen, Search, Filter, Plus, FileVideo, CheckSquare } from 'lucide-react';",
  "import { FolderTree, BookOpen, Search, Filter, Plus, FileVideo, CheckSquare, Book } from 'lucide-react';"
);

code = code.replace(
  "{ label: 'Catégories', path: '/admin/catalog/categories', icon: FolderTree },",
  "{ label: 'Catégories', path: '/admin/catalog/categories', icon: FolderTree },\n    { label: 'Ebooks', path: '/admin/catalog/ebooks', icon: Book },"
);

code = code.replace(
  "<Route path=\"/categories\" element={<CategoriesManager />} />",
  "<Route path=\"/categories\" element={<CategoriesManager />} />\n          <Route path=\"/ebooks\" element={<EbooksManager />} />"
);

fs.writeFileSync('src/views/admin/catalogue/AdminCatalogView.tsx', code);
console.log("Done patching AdminCatalogView.tsx");
