import React, { useEffect } from 'react';
import { useSchedule } from '../../hooks/useSchedule';
import { Calendar } from '../../components/schedule/Calendar';
import { EventCard } from '../../components/schedule/EventCard';
import { Loader2, AlertCircle, CalendarDays } from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const { events, eventsForSelectedDate, loading, error, isMockData, selectedDate, setSelectedDate, fetchEvents } = useSchedule();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventClick = (eventId: string) => {
    // For the isolated phase, we just alert. Normally we would route to the detail page.
    alert(`Navigation vers les détails de l'événement / session: ${eventId} (Préparation Routeur)`);
    // Example: navigate(ScheduleRoutes.LiveSessionPath(eventId));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Planning & Sessions
            {isMockData && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                Mock
              </span>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gérez votre emploi du temps et réservez vos sessions live.
          </p>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Column: Calendar (sticky on desktop) */}
        <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-8">
          <Calendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
            events={events} 
          />
        </div>

        {/* Right Column: Events List */}
        <div className="flex-1 w-full flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
              {eventsForSelectedDate.length} événement(s)
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p>Chargement du planning...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Erreur de connexion</h3>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <button 
                onClick={() => fetchEvents()}
                className="px-6 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-100 rounded-xl font-medium transition-colors min-h-[44px]"
              >
                Réessayer
              </button>
            </div>
          ) : eventsForSelectedDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
              <CalendarDays className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun événement</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Il n'y a rien de prévu pour cette date. Profitez-en pour réviser !
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {eventsForSelectedDate.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onClick={handleEventClick} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
