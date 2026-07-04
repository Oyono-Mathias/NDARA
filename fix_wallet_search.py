import re

with open('src/views/Wallet.tsx', 'r') as f:
    content = f.read()

# Add states for search and pagination
state_inject = """
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
"""

content = content.replace('  const [filter, setFilter] = useState("all");', '  const [filter, setFilter] = useState("all");\n' + state_inject)

# Create the filtered and paginated transactions
logic_inject = """
  const filteredTransactions = dbTransactions.filter(i => {
    if (filter !== 'all') {
      if (filter === 'deposit' && i.type !== 'deposit') return false;
      if (filter === 'purchase' && i.type !== 'purchase') return false;
      if (filter === 'transfer' && i.type !== 'transfer_send' && i.type !== 'transfer_receive' && i.type !== 'transfer') return false;
      if (filter === 'affiliate' && i.type !== 'affiliate_payout' && i.type !== 'course_sale') return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!i.description?.toLowerCase().includes(term) && !i.type.toLowerCase().includes(term) && !i.amount.toString().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

"""

content = content.replace('  // Status banners', logic_inject + '\n  // Status banners')

# Replace the render logic
render_logic = """
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          {paginatedTransactions.length > 0 ? (
            <>
              {paginatedTransactions.map((item) => {
"""

content = re.sub(r'\{dbTransactions\.filter\(i => \{[\s\S]*?dbTransactions\.filter\(i => \{[\s\S]*?\.map\(\(item\) => \{', render_logic, content)

pagination_ui = """
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 p-4">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <span className="text-slate-400 text-sm">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
"""

content = re.sub(r'</button>\s*</div>\s*\)\}\s*</>\s*\)\s*:\s*\(', pagination_ui, content)

with open('src/views/Wallet.tsx', 'w') as f:
    f.write(content)
