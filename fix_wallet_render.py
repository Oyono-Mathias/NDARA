import re

with open('src/views/Wallet.tsx', 'r') as f:
    content = f.read()

# Fix the syntax error at the end of the map block
correct_pagination_ui = """
              );
            })}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 p-4">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
                  >
                    Précédent
                  </button>
                  <span className="text-slate-400 text-sm font-medium">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          ) : (
"""

content = re.sub(r'\s*\);\s*\}\)\s*\)\s*:\s*\(', correct_pagination_ui, content)

with open('src/views/Wallet.tsx', 'w') as f:
    f.write(content)
