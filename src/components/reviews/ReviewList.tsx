import React, { useEffect } from 'react';
import { useReviews } from '../../hooks/useReviews';
import { StarRating } from './StarRating';
import { Loader2, AlertCircle, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

interface ReviewListProps {
  courseId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ courseId }) => {
  const { reviews, loading, error, fetchReviewsData, summary } = useReviews(courseId);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  if (loading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Chargement des avis...</p>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-red-700 dark:text-red-400 font-medium mb-4">{error}</p>
        <button 
          onClick={fetchReviewsData} 
          className="px-5 py-2.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-xl font-bold min-h-[44px]"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Résumé des avis */}
      {summary && (
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
            <span className="text-4xl font-black text-gray-900 dark:text-white">
              {summary.averageRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(summary.averageRating)} readOnly size="sm" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
              {summary.totalReviews} avis
            </span>
          </div>
          
          {/* Distribution visuelle basique */}
          <div className="flex-1 w-full flex flex-col gap-1.5 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-4 sm:pt-0 sm:pl-6">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star as keyof typeof summary.distribution] || 0;
              const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1 w-8 shrink-0">
                    <span className="font-bold">{star}</span>
                    <StarRating value={1} readOnly size="sm" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right font-mono text-[10px]">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50 dark:bg-gray-800/20 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4 opacity-50" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">Aucun avis pour le moment.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Soyez le premier à évaluer ce cours !</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <article 
              key={review.id} 
              className={`flex flex-col p-5 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm gap-3 transition-colors ${
                review.status === 'pending' ? 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10' : 'border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {review.userDisplayName}
                    </h4>
                    {review.isVerifiedLearner && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded uppercase">
                        <ShieldCheck className="w-3 h-3" /> Vérifié
                      </span>
                    )}
                    {review.isMock && (
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase">
                        Mock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} readOnly size="sm" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                {review.status === 'pending' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 rounded-lg uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    En attente de modération
                  </div>
                )}
              </div>

              {/* Utilisation stricte du texte pur pour éviter les injections */}
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words whitespace-pre-wrap mt-1">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
