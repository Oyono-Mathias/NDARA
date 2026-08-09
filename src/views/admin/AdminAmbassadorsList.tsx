import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, Trophy, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AdminAmbassadorsList() {
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const ambsSnap = await getDocs(collection(db, 'ambassadors'));
        
        const usersMap = new Map();
        usersSnap.forEach(doc => {
          usersMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        
        const data = ambsSnap.docs.map(doc => {
          const ambData = doc.data();
          const userData = usersMap.get(doc.id) || {};
          return {
            id: doc.id,
            ...ambData,
            name: userData.displayName || ambData.name || 'Inconnu',
            email: userData.email || ambData.email || 'Aucun email',
            role: userData.role || 'student',
            createdAt: userData.createdAt || ambData.createdAt,
            lastLoginAt: userData.lastLoginAt || ambData.lastLoginAt
          };
        });
        
        // Sort by totalClicks or createdAt
        data.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });
        
        setAmbassadors(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load ambassadors", err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = ambassadors.filter(a => 
    (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Tous les utilisateurs (Ambassadeurs)</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="p-4 font-medium">Utilisateur</th>
                <th className="p-4 font-medium text-center">Rôle</th>
                <th className="p-4 font-medium text-center">Création</th>
                <th className="p-4 font-medium text-center">Dernière co.</th>
                <th className="p-4 font-medium text-center">Clics</th>
                <th className="p-4 font-medium text-center">Inscriptions</th>
                <th className="p-4 font-medium text-center">Ventes</th>
                <th className="p-4 font-medium text-right">CA Généré</th>
                <th className="p-4 font-medium text-right">Commission</th>
                <th className="p-4 font-medium text-right">Solde</th>
                <th className="p-4 font-medium text-center">Niveau</th>
                <th className="p-4 font-medium text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map(a => (
                <tr 
                  key={a.id} 
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/admin/ambassador/profile/${a.id}`)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 capitalize">{a.role}</span>
                  </td>
                  <td className="p-4 text-center text-slate-300">
                    {a.createdAt?.toDate ? format(a.createdAt.toDate(), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="p-4 text-center text-slate-300">
                    {a.lastLoginAt?.toDate ? format(a.lastLoginAt.toDate(), 'dd/MM/yyyy HH:mm') : '-'}
                  </td>
                  <td className="p-4 text-center font-bold text-slate-300">{a.totalClicks || 0}</td>
                  <td className="p-4 text-center font-bold text-slate-300">{a.totalRegistrations || 0}</td>
                  <td className="p-4 text-center font-bold text-emerald-400">{a.totalSales || 0}</td>
                  <td className="p-4 text-right font-bold text-slate-300">{(a.totalRevenue || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-4 text-right font-bold text-emerald-400">{(a.totalCommission || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-4 text-right font-bold text-emerald-400">{(a.availableBalance || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full">{a.level || 'Bronze'}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={clsx(
                      "px-2 py-1 rounded text-xs font-bold",
                      a.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {a.status === 'active' ? 'ACTIF' : 'INACTIF'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/ambassador/profile/${a.id}`); }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors mx-auto"
                    >
                      PROFIL <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-slate-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
