import React, { useEffect, useState } from 'react';
import { Mentor, MentorshipProgram } from '../../services/mentoringService';
import { useMentoring } from '../../hooks/useMentoring';
import { Calendar, Clock, Globe, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SessionBookingProps {
  mentor: Mentor;
  program: MentorshipProgram;
  onBack: () => void;
}

export const SessionBooking: React.FC<SessionBookingProps> = ({ mentor, program, onBack }) => {
  const { status, error, slots, lastSession, loadAvailability, bookSession, resetStatus } = useMentoring();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  useEffect(() => {
    loadAvailability(mentor.id);
  }, [mentor.id, loadAvailability]);

  const handleBooking = () => {
    if (!selectedSlotId) return;
    bookSession({
      mentorId: mentor.id,
      programId: program.id,
      slotId: selectedSlotId
    });
  };

  const renderContent = () => {
    if (status === 'loading_slots') {
      return (
        <div className="flex flex-col items-center justify-center p-8 gap-4 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p>Chargement des disponibilités...</p>
        </div>
      );
    }

    if (status === 'success' && lastSession) {
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center gap-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900">Réservation confirmée !</h3>
          <p className="text-emerald-800 text-sm">
            Votre session avec <strong>{mentor.displayName}</strong> a bien été enregistrée.
            <br />
            Référence : <span className="font-mono font-bold">{lastSession.bookingReference}</span>
          </p>
          {lastSession.isMock && (
            <span className="inline-block mt-2 px-2 py-1 bg-emerald-200/50 text-emerald-800 text-xs font-bold uppercase rounded-md">
              Données simulées (Mock)
            </span>
          )}
          <button 
            onClick={() => { resetStatus(); onBack(); }}
            className="mt-4 min-h-[44px] px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
          >
            Retour aux programmes
          </button>
        </div>
      );
    }

    const availableSlots = slots.filter(s => s.status === 'available');

    return (
      <div className="flex flex-col gap-6">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-3">Récapitulatif</h4>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Programme</span>
              <span className="font-medium text-right break-words max-w-[60%]">{program.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mentor</span>
              <span className="font-medium">{mentor.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tarif</span>
              <span className="font-bold">
                {program.price === 0 ? 'Gratuit' : `${program.price} ${program.currency}`}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-3">Choisissez un créneau</h4>
          {availableSlots.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Aucun créneau disponible pour ce mentor actuellement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all min-h-[44px] ${
                    selectedSlotId === slot.id 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-200 bg-white hover:border-indigo-200'
                  }`}
                  aria-pressed={selectedSlotId === slot.id}
                >
                  <div className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {slot.startTime} - {slot.endTime}</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Heure {slot.timezone}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleBooking}
          disabled={!selectedSlotId || status === 'booking'}
          className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'booking' ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Confirmation en cours...</>
          ) : (
            'Confirmer la réservation'
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <button 
        onClick={onBack}
        disabled={status === 'booking'}
        className="self-start flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium py-2 disabled:opacity-50 min-h-[44px]"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour aux mentors
      </button>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900">Réserver une session</h2>
          <p className="text-gray-500 mt-1">Vérifiez les informations et sélectionnez un horaire.</p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};
