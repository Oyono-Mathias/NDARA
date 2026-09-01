import React, { useState, useEffect } from 'react';
import { NotificationService, NotificationPreference, NotificationCategory } from '../../services/notificationService';
import { NotificationRoutes } from '../../routes/notificationRoutes';
import { Save, AlertTriangle, RefreshCw } from 'lucide-react';

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPrefs = async () => {
      try {
        setLoading(true);
        const prefs = await NotificationRoutes.fetchPreferences();
        if (isMounted) {
          // Fallback sur les préférences par défaut si le backend ne retourne rien
          setPreferences(prefs.length > 0 ? prefs : NotificationService.getDefaultPreferences());
        }
      } catch (err: any) {
        if (isMounted) setError("Erreur lors du chargement des préférences.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPrefs();
    return () => { isMounted = false; };
  }, []);

  const toggleCategory = (category: NotificationCategory) => {
    setPreferences(prev => prev.map(p => {
      if (p.category === category) {
        // Les catégories critiques ne peuvent pas être désactivées
        if (p.isCritical) return p;
        return { ...p, enabled: !p.enabled };
      }
      return p;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const success = await NotificationRoutes.updatePreferences(preferences);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        // Le backend est indisponible ou l'API a retourné false
        setError("Impossible de sauvegarder. Vérifiez la connexion au serveur.");
      }
    } catch (err: any) {
      setError("Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Préférences de Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Gérez comment et quand vous souhaitez être informé.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded-r-lg flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {preferences.map((pref) => (
          <div key={pref.category} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
            <div className="pr-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                {pref.category === 'marketing' ? 'Offres & Marketing' : pref.category}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {pref.isCritical 
                  ? "Notifications critiques requises pour la sécurité ou les transactions." 
                  : "Notifications informatives ou commerciales."}
              </p>
            </div>
            
            <button
              onClick={() => toggleCategory(pref.category)}
              disabled={pref.isCritical}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                pref.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
              } ${pref.isCritical ? 'opacity-50 cursor-not-allowed' : ''}`}
              role="switch"
              aria-checked={pref.enabled}
              aria-label={`Activer les notifications ${pref.category}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  pref.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-end border-t border-gray-100 dark:border-gray-800 pt-6">
        {saveSuccess && <span className="text-sm text-green-600 mr-4 font-medium">Préférences sauvegardées !</span>}
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center min-h-[44px] px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Sauvegarder</>}
        </button>
      </div>
    </div>
  );
};
