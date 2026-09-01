import React, { useState, useEffect } from 'react';
import { RoleService, Role } from '../../services/roleService';
import { Shield, AlertTriangle, Users, Search, Loader2 } from 'lucide-react';

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pour la simulation d'attribution
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await RoleService.getRoles();
      setRoles(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSimulateAssignment = async (role: Role) => {
    if (window.confirm(`Simuler l'attribution du rôle ${role.name} à un utilisateur test ?`)) {
      setIsAssigning(true);
      setAssignmentMessage(null);
      try {
        const result = await RoleService.assignRoleToUser('test_user_id', role.id);
        setAssignmentMessage({ type: 'success', text: result.message });
      } catch (err: unknown) {
        setAssignmentMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' });
      } finally {
        setIsAssigning(false);
        setTimeout(() => setAssignmentMessage(null), 4000);
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 gap-6">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          Gestion des Rôles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administrez les niveaux d'accès de l'application. 
        </p>
      </div>

      {RoleService.STATUS.isMock && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Mode Démonstration (Mock) Actif
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Aucune donnée n'est connectée à Firebase. Toute modification simulée ne persistera pas.
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Rechercher un rôle..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full min-h-[48px] pl-12 pr-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {assignmentMessage && (
        <div className={`p-4 rounded-xl text-sm font-medium ${
          assignmentMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {assignmentMessage.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRoles.map(role => (
            <div key={role.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {role.name}
                    </h3>
                    {role.isSystem && (
                      <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs px-2 py-0.5 rounded font-bold">
                        Système
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    role.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {role.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Permissions associées ({role.permissions.length})</span>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map(p => (
                    <span key={p} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleSimulateAssignment(role)}
                  disabled={isAssigning}
                  className="min-h-[44px] flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-300 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  Simuler Attribution
                </button>
              </div>
            </div>
          ))}
          
          {filteredRoles.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              Aucun rôle trouvé.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
