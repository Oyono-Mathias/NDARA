import React from 'react';
import { ScheduleEvent, LiveSession } from '../../services/scheduleService';
import { Clock, User, Video, BookOpen, PenTool } from 'lucide-react';

interface EventCardProps {
  event: ScheduleEvent | LiveSession;
  onClick: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const isLive = event.type === 'live';
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getEventIcon = () => {
    switch (event.type) {
      case 'live': return <Video className="w-5 h-5" />;
      case 'course': return <BookOpen className="w-5 h-5" />;
      case 'assignment': return <PenTool className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case 'live': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'course': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'assignment': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getEventLabel = () => {
    switch (event.type) {
      case 'live': return 'Session Live';
      case 'course': return 'Cours';
      case 'assignment': return 'Devoir';
      default: return 'Événement';
    }
  };

  const getStatusBadge = () => {
    if (!isLive) return null;
    const liveSession = event as LiveSession;

    switch (liveSession.status) {
      case 'full':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 shrink-0">Complet</span>;
      case 'past':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 shrink-0">Passé</span>;
      case 'cancelled':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">Annulé</span>;
      case 'open':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">Disponible</span>;
      default:
        return null;
    }
  };

  return (
    <div 
      onClick={() => onClick(event.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(event.id);
        }
      }}
      className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-pointer group shadow-sm min-h-[44px]"
      aria-label={`${getEventLabel()} : ${event.title}, de ${formatTime(event.startAt)} à ${formatTime(event.endAt)}.`}
    >
      {/* Time & Type Column */}
      <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:w-32 shrink-0">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white text-lg">
            {formatTime(event.startAt)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatTime(event.endAt)}
          </span>
        </div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${getEventColor()}`}>
          {getEventIcon()}
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${getEventColor()}`}>
            {getEventLabel()}
          </span>
          {getStatusBadge()}
          {isLive && (event as LiveSession).userBookingStatus === 'confirmed' && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Inscrit
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <User className="w-4 h-4 shrink-0" />
          <span className="truncate">{event.instructor.name}</span>
        </div>
      </div>
    </div>
  );
};
