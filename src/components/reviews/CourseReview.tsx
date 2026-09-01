import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { useReviews } from '../../hooks/useReviews';
import { RatingValue } from '../../services/reviewService';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';

interface CourseReviewProps {
  courseId: string;
}

export const CourseReview: React.FC<CourseReviewProps> = ({ courseId }) => {
  const { submitReview, submitting, submitError, submitSuccess } = useReviews(courseId);
  
  const [rating, setRating] = useState<RatingValue | 0>(0);
  const [comment, setComment] = useState<string>('');
  
  const MAX_CHARS = 2000;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) return;
    
    const trimmedComment = comment.trim();
    if (trimmedComment.length === 0 || trimmedComment.length > MAX_CHARS) return;

    const success = await submitReview({ rating, comment: trimmedComment });
    
    if (success) {
      setRating(0);
      setComment('');
    }
  };

  const isCommentValid = comment.trim().length > 0 && comment.trim().length <= MAX_CHARS;
  const isFormValid = rating > 0 && isCommentValid;

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
        <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-2">Avis soumis avec succès</h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-300">
          Merci pour votre évaluation ! Votre avis est en cours de modération et sera publié prochainement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Évaluer ce cours</h3>
      
      {submitError && (
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{submitError}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Votre note <span className="text-red-500">*</span>
        </label>
        {/* Encapsulation Android First pour s'assurer que les étoiles sont facilement tapables sans déborder */}
        <div className="-ml-2">
          <StarRating 
            value={rating} 
            onChange={(val) => setRating(val)} 
            size="lg" 
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-comment" className="flex justify-between items-end text-sm font-semibold text-gray-700 dark:text-gray-300">
          <span>Votre commentaire <span className="text-red-500">*</span></span>
          <span className={`text-xs font-mono ${comment.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400'}`}>
            {comment.length} / {MAX_CHARS}
          </span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Qu'avez-vous pensé de ce cours ? Qu'avez-vous appris ?"
          className={`
            w-full min-h-[120px] p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl 
            text-sm text-gray-900 dark:text-white resize-none transition-shadow
            focus:ring-2 focus:ring-indigo-500/50 outline-none
            ${comment.length > MAX_CHARS ? 'border-red-300 dark:border-red-800 focus:ring-red-500/50' : 'border-gray-200 dark:border-gray-700'}
          `}
          disabled={submitting}
          aria-invalid={comment.length > MAX_CHARS}
        />
      </div>

      <button
        type="submit"
        disabled={!isFormValid || submitting}
        className={`
          flex items-center justify-center gap-2 w-full sm:w-auto self-end px-6 py-3 
          rounded-xl font-bold transition-all min-h-[44px]
          ${isFormValid && !submitting
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Envoyer l'avis
          </>
        )}
      </button>
    </form>
  );
};
