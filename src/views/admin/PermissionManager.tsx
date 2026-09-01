import React, { useState, useEffect, useMemo } from 'react';
import { RoleService, Permission } from '../../services/roleService';
import { Key, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';

export const PermissionManager: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await RoleService.getPermissions();
      setPermissions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(p => {
      if (!groups[p.resource]) groups[p.resource] = [];
      groups[p.resource].push(p);
    });
    return groups;
  }, [permissions]);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 gap-6">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Key className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          Référentiel des Permissions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Liste de toutes les permissions granulaires disponibles dans le système.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Règle Zero Trust (Zero Confiance)
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Le frontend n'est pas une barrière de sécurité. Les permissions listées ici servent au 
          "PermissionMiddleware" pour améliorer l'UX (masquer/afficher). 
          Toute transaction ou modification réelle sera soumise aux Security Rules de Firestore et à la validation des Cloud Functions.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource} className="flex flex-col gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider pl-1 border-l-4 border-indigo-500">
                {resource}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {perms.map(p => (
                  <div 
                    key={p.id} 
                    className={`p-4 rounded-xl border ${
                      p.sensitive 
                        ? 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' 
                        : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800'
                    } flex flex-col gap-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-gray-900 dark:text-gray-100 break-all">
                        {p.id}
                      </span>
                      {p.sensitive && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0">
                          <ShieldAlert className="w-3 h-3" />
                          Sensible
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                      {p.description}
                    </p>
                    <div className="mt-2 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 w-fit px-2 py-1 rounded">
                      Action: {p.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
