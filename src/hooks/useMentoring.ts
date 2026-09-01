import { useState, useCallback } from 'react';
import { 
  MentoringService, 
  MentorshipProgram, 
  MentorMatch, 
  AvailabilitySlot, 
  BookingRequest,
  MentoringSession
} from '../services/mentoringService';

type MentoringState = 'idle' | 'loading_programs' | 'loading_mentors' | 'loading_slots' | 'booking' | 'success' | 'error' | 'empty';

export const useMentoring = () => {
  const [status, setStatus] = useState<MentoringState>('idle');
  const [error, setError] = useState<string | null>(null);

  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [mentorMatches, setMentorMatches] = useState<MentorMatch[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  
  const [lastSession, setLastSession] = useState<MentoringSession | null>(null);

  const loadPrograms = useCallback(async () => {
    setStatus('loading_programs');
    setError(null);
    try {
      const res = await MentoringService.getMentorshipPrograms();
      if (res.error) throw new Error(res.error);
      setPrograms(res.data);
      setStatus(res.data.length > 0 ? 'idle' : 'empty');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des programmes');
      setStatus('error');
    }
  }, []);

  const searchMentors = useCallback(async (domain?: string, language?: string) => {
    setStatus('loading_mentors');
    setError(null);
    try {
      const res = await MentoringService.findMentors({ domain, language });
      if (res.error) throw new Error(res.error);
      setMentorMatches(res.data);
      setStatus(res.data.length > 0 ? 'idle' : 'empty');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recherche de mentors');
      setStatus('error');
    }
  }, []);

  const loadAvailability = useCallback(async (mentorId: string) => {
    setStatus('loading_slots');
    setError(null);
    try {
      const res = await MentoringService.getMentorAvailability(mentorId);
      if (res.error) throw new Error(res.error);
      setSlots(res.data);
      setStatus(res.data.length > 0 ? 'idle' : 'empty');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des disponibilités');
      setStatus('error');
    }
  }, []);

  const bookSession = useCallback(async (request: BookingRequest) => {
    if (status === 'booking') return; // Prevent double submit
    setStatus('booking');
    setError(null);
    try {
      const res = await MentoringService.createBooking(request);
      if (res.error || res.data.status !== 'confirmed') {
        throw new Error(res.error || 'La réservation n\'a pas pu aboutir.');
      }
      setLastSession(res.data.session || null);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réservation');
      setStatus('error');
    }
  }, [status]);

  return {
    status,
    error,
    programs,
    mentorMatches,
    slots,
    lastSession,
    loadPrograms,
    searchMentors,
    loadAvailability,
    bookSession,
    resetStatus: () => setStatus('idle')
  };
};
