import { useState, useCallback } from 'react';
import { ScheduleService, ScheduleEvent, LiveSession } from '../services/scheduleService';

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ScheduleService.getSchedule();
      setEvents(response.events);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement du planning.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessionById = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ScheduleService.getLiveSessionById(sessionId);
      setCurrentSession(response.session);
      setIsMockData(response.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de la session.");
    } finally {
      setLoading(false);
    }
  }, []);

  const bookSession = async (sessionId: string): Promise<boolean> => {
    try {
      const response = await ScheduleService.bookLiveSession(sessionId);
      
      // Update local state if it's the current session
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(prev => {
          if (!prev) return prev;
          const newBookedCount = prev.bookedCount + 1;
          return {
            ...prev,
            bookedCount: newBookedCount,
            userBookingStatus: 'confirmed',
            status: newBookedCount >= prev.capacity ? 'full' : prev.status
          };
        });
      }
      return response.success;
    } catch (err) {
      throw err; // Let the UI handle the specific error (like SESSION_FULL)
    }
  };

  // Helper to get events for the currently selected date
  const eventsForSelectedDate = events.filter(event => {
    const eventDate = new Date(event.startAt);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  }).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return {
    events,
    eventsForSelectedDate,
    currentSession,
    loading,
    error,
    isMockData,
    selectedDate,
    setSelectedDate,
    fetchEvents,
    fetchSessionById,
    bookSession
  };
}
