import React, { useEffect } from 'react';
import { useCoupons } from '../../hooks/useCoupons';
import { Loader2, Gift, Clock, AlertCircle } from 'lucide-react';

export const PromotionBanner: React.FC = () => {
  const { promotions, loadingPromotions, fetchActivePromotions, error } = useCoupons();

  useEffect(() => {
    fetchActivePromotions();
  }, [fetchActivePromotions]);

  if (loadingPromotions) {
    return (
      <div className="flex items-center justify-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-100 dark:border-red-900/50">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>Impossible de charger les promotions en cours.</p>
      </div>
    );
  }

  if (!promotions || promotions.length === 0) {
    return null;
  }

  // On affiche uniquement la première promotion active pour ne pas surcharger l'UI
  const activePromo = promotions[0];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-lg border border-indigo-500/20">
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-black/10 blur-2xl rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 sm:p-8">
        
        {/* Image Fallback Icon */}
        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-inner">
          <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        {/* Contenu */}
        <div className="flex flex-col flex-1 text-center md:text-left text-white">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-indigo-50">
              Offre Spéciale
            </span>
            {activePromo.isMock && (
              <span className="bg-black/20 backdrop-blur-md px-2 py-1 rounded-md text-[9px] font-bold uppercase text-white/70">
                Mock
              </span>
            )}
          </div>
          
          <h3 className="text-xl sm:text-2xl font-black mb-1">{activePromo.title}</h3>
          
          <p className="text-sm sm:text-base text-indigo-100 mb-4 leading-relaxed break-words">
            {activePromo.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm font-medium">
            <span className="inline-flex items-center px-3 py-1.5 bg-white text-indigo-700 rounded-lg font-bold shadow-sm">
              {activePromo.discountText}
            </span>
            
            <span className="flex items-center gap-1.5 text-indigo-200">
              <Clock className="w-4 h-4" />
              Jusqu'au {new Date(activePromo.expiresAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>

          {activePromo.conditions && (
            <p className="mt-4 text-[10px] text-indigo-300/80 leading-tight">
              * {activePromo.conditions}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
