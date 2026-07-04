import re

with open('src/views/catalog/CatalogView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Search, Filter, BookOpen, Star, PlayCircle, Loader2 } from 'lucide-react';", "import { Search, Filter, BookOpen, Star, PlayCircle, Loader2 } from 'lucide-react';\nimport { CatalogSkeleton } from '../../components/catalog/CatalogSkeleton';")

old_loader = """  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }"""
  
new_loader = """  if (loading) {
    return <CatalogSkeleton />;
  }"""

content = content.replace(old_loader, new_loader)

with open('src/views/catalog/CatalogView.tsx', 'w') as f:
    f.write(content)
