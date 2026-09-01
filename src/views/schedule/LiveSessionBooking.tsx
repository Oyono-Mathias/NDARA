import React, { useEffect, useState } from 'react';
import { useSchedule } from '../../hooks/useSchedule';
import { Loader2, AlertCircle, ArrowLeft, CalendarDays, Clock, User, Users, Video } from 'lucide-react';

interface LiveSessionBookingProps {
  sessionId: string;
  onBack: () => void;
}

export const LiveSessionBooking: React.FC<LiveSessionBookingProps> = ({ sessionId, onBack }) => {
  const { currentSession, loading, error, isMockData, fetchSessionById, bookSession } = useSchedule();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionById(sessionId);
  }, [sessionId, fetchSessionById]);

  const handleBook = async () => {
    if (!currentSession) return;
    
    setIsBooking(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const success = await bookSession(currentSession.id);
      if (success) {
        setBookingSuccess(isMockData 
          ? "Réservation mockée avec succès. BACKEND_NOT_CONNECTED." 
          : "Réservation confirmée avec succès."
        );
      }
    } catch (err) {
      let errorMessage = "Erreur lors de la réservation.";
      if (err instanceof Error) {
        if (err.message.includes('BACKEND_NOT_CONNECTED')) {
          errorMessage = "Erreur : Le service Backend n'est pas connecté. Action annulée.";
        } else {
          errorMessage = err.message;
        }
      }
      setBookingError(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading && !currentSession) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Chargement de la session...</p>
      </div>
    );
  }

  if (error || !currentSession) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 flex flex-col gap-4">
        <button onClick={onBack} className="self-start flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl border border-red-200 dark:border-red-800/50 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Session introuvable</h2>
          <p className="text-red-600 dark:text-red-300">{error || "Cette session n'existe pas."}</p>
        </div>
      </div>
    );
  }

  const spotsLeft = currentSession.capacity - currentSession.bookedCount;
  
  const renderBookingSection = () => {
    if (currentSession.status === 'cancelled') {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 text-center text-red-700 dark:text-red-400">
          Cette session a été annulée.
        </div>
      );
    }

    if (currentSession.status === 'past') {
      return (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">
          Cette session est déjà terminée.
        </div>
      );
    }

    if (currentSession.userBookingStatus === 'confirmed') {
      return (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Réservation confirmée</h3>
          <p className="text-emerald-700 dark:text-emerald-400 text-sm">
            Vous êtes inscrit à cette session. Le lien de connexion sera disponible ici peu avant le début.
          </p>
          {bookingSuccess && (
            <p className="text-xs font-mono bg-emerald-100 dark:bg-emerald-900 p-2 rounded text-emerald-800 dark:text-emerald-200 mt-2">
              {bookingSuccess}
            </p>
          )}
        </div>
      );
    }

    if (currentSession.status === 'full' || spotsLeft <= 0) {
      return (
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 text-center text-orange-700 dark:text-orange-400">
          Cette session est complète. Il n'y a plus de places disponibles.
        </div>
      );
    }

    // Open & not booked
    return (
      <div className="flex flex-col gap-4">
        {bookingError && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{bookingError}</span>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800/50 flex flex-col items-center text-center gap-4">
          <p className="text-blue-800 dark:text-blue-300 font-medium">
            Il reste <span className="font-bold text-xl">{spotsLeft}</span> place{spotsLeft > 1 ? 's' : ''} disponible{spotsLeft > 1 ? 's' : ''}.
          </p>
          <button
            onClick={handleBook}
            disabled={isBooking}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isBooking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Traitement...
              </>
            ) : (
              "Réserver ma place"
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack} 
          className="self-start flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px] font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au planning
        </button>

        {isMockData && (
          <span className="self-start bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
            Mock
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Session Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {currentSession.title}
          </h1>
          <p className="text-blue-100 opacity-90 max-w-2xl">
            {currentSession.description}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Date</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {new Date(currentSession.startAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Horaire</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {new Date(currentSession.startAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(currentSession.endAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs text-gray-400">{currentSession.timezone}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Instructeur</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {currentSession.instructor.name}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Capacité</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {currentSession.capacity} participants maximum
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Booking Action Area */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
              Réservation
            </h3>
            {renderBookingSection()}
          </div>
        </div>
      </div>
    </div>
  );
};
