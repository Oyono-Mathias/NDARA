import { useState, useCallback } from 'react';
import { 
  ReviewService, 
  Review, 
  CourseRatingSummary, 
  SubmitReviewPayload 
} from '../services/reviewService';

export const useReviews = (courseId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<CourseRatingSummary | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const fetchReviewsData = useCallback(async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, reviewsRes] = await Promise.all([
        ReviewService.getCourseRatingSummary(courseId),
        ReviewService.getCourseReviews(courseId)
      ]);
      setSummary(summaryRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      setError('Impossible de charger les avis. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const submitReview = useCallback(async (payload: SubmitReviewPayload) => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const res = await ReviewService.submitReview(courseId, payload);
      // Ajout optimiste en tête de liste pour montrer l'état 'pending'
      setReviews(prev => [res.data, ...prev]);
      setSubmitSuccess(true);
      return true;
    } catch (err) {
      setSubmitError('Une erreur est survenue lors de la soumission de votre avis. Veuillez réessayer.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [courseId]);

  return {
    reviews,
    summary,
    loading,
    error,
    submitting,
    submitError,
    submitSuccess,
    fetchReviewsData,
    submitReview
  };
};
