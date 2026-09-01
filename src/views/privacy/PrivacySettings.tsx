import React, { useEffect, useState } from 'react';
import { PrivacyService, PrivacyPreferences } from '../../services/privacyService';
import { Shield, Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PrivacySettings: React.FC = () => {
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    marketingCommunications: false,
    analyticsCollection: false,
    experiencePersonalization: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadPreferences = async () => {
      try {
        const response = await PrivacyService.getPreferences();
        if (isMounted) {
          setPreferences(response.data);
          setIsMock(response.isMock);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setMessage({ type: 'error', text: 'Impossible de charger vos préférences actuelles.' });
          setIsLoading(false);
        }
      }
    };

    loadPreferences();
    
    return () => { isMounted = false; };
  }, []);

  const handleToggle = (key: keyof PrivacyPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const response = await PrivacyService.updatePreferences(preferences);
      setMessage({ type: 'success', text: response.message || 'Vos préférences ont été mises à jour.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de la sauvegarde.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-gray-500 text-sm">Chargement de vos paramètres...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-500" />
          Confidentialité
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Gérez vos préférences de données et de communication.
        </p>
        {isMock && (
          <div className="mt-2 inline-flex items-center gap-1.5 self-start px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-bold rounded-md uppercase tracking-wide border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Mode démonstration
          </div>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' : 
          'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800/50'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Formulaire des paramètres */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
        
        {/* Personnalisation */}
        <label className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-h-[44px]">
          <div className="flex-1 flex flex-col gap-1">
            <span className="font-semibold text-gray-900 dark:text-white">Personnalisation de l'expérience</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Utiliser votre historique d'apprentissage pour vous recommander des cours pertinents.
            </span>
          </div>
          <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={preferences.experiencePersonalization}
              onChange={() => handleToggle('experiencePersonalization')}
              disabled={isSaving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary peer-disabled:opacity-50"></div>
          </div>
        </label>

        {/* Analytique */}
        <label className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-h-[44px]">
          <div className="flex-1 flex flex-col gap-1">
            <span className="font-semibold text-gray-900 dark:text-white">Collecte de données analytiques</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Nous aider à améliorer Ndara en partageant des statistiques d'utilisation anonymisées.
            </span>
          </div>
          <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={preferences.analyticsCollection}
              onChange={() => handleToggle('analyticsCollection')}
              disabled={isSaving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary peer-disabled:opacity-50"></div>
          </div>
        </label>

        {/* Marketing */}
        <label className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-h-[44px]">
          <div className="flex-1 flex flex-col gap-1">
            <span className="font-semibold text-gray-900 dark:text-white">Communications marketing</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Recevoir des offres promotionnelles et des actualités par email.
            </span>
          </div>
          <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={preferences.marketingCommunications}
              onChange={() => handleToggle('marketingCommunications')}
              disabled={isSaving}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary peer-disabled:opacity-50"></div>
          </div>
        </label>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[140px]"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer
            </>
          )}
        </button>
      </div>
    </div>
  );
};
