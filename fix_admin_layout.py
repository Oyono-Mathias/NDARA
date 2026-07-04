import re

with open('src/views/admin/AdminLayout.tsx', 'r') as f:
    content = f.read()

content = content.replace('import { AdminNavigation } from "../../components/AdminNavigation";', 
'''import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { AdminFooter } from "../../components/admin/AdminFooter";''')

content = content.replace('<AdminNavigation', '<AdminSidebar')
content = content.replace('''<div className="md:hidden flex items-center h-16 px-4 border-b border-slate-800/50 bg-[#090E17]/90 backdrop-blur-md shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-black text-white tracking-widest text-sm uppercase">
            NDARA ADMIN
          </span>
        </div>''', '<AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />')

content = content.replace('</main>\n        </div>', '</main>\n          <AdminFooter />\n        </div>')

with open('src/views/admin/AdminLayout.tsx', 'w') as f:
    f.write(content)
