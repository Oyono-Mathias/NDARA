const fs = require('fs');
let code = fs.readFileSync('src/views/admin/AdminAmbassadorsList.tsx', 'utf8');

const targetTableHead = `                  <th className="p-4 text-center">Niveau</th>
                  <th className="p-4 text-center">Statut</th>
                </tr>`;
const newTableHead = `                  <th className="p-4 text-center">Niveau</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-center">Action</th>
                </tr>`;
code = code.replace(targetTableHead, newTableHead);

const targetStatusCell = `                      {a.status === 'active' ? 'ACTIF' : 'INACTIF'}
                    </span>
                  </td>
                </tr>`;
const newStatusCell = `                      {a.status === 'active' ? 'ACTIF' : 'INACTIF'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(\`/admin/ambassador/profile/\${a.id}\`); }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors mx-auto"
                    >
                      PROFIL <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>`;
code = code.replace(targetStatusCell, newStatusCell);

const targetColspan = `colSpan={12}`;
const newColspan = `colSpan={13}`;
code = code.replace(targetColspan, newColspan);

fs.writeFileSync('src/views/admin/AdminAmbassadorsList.tsx', code);
