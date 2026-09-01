import React from 'react';
import { MentorMatch } from '../../services/mentoringService';
import { Star, Clock, CheckCircle, Languages, Briefcase } from 'lucide-react';

interface MentorCardProps {
  match: MentorMatch;
  onSelect: (mentorId: string) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ match, onSelect }) => {
  const { mentor, matchScore, matchingReasons } = match;

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'soon': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'soon': return 'Bientôt disponible';
      default: return 'Indisponible';
    }
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl p-5 gap-4 shadow-sm">
      <div className="flex flex-row items-start gap-4">
        {/* Avatar Placeholder */}
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
          {mentor.avatarUrl ? (
            <img src={mentor.avatarUrl} alt={mentor.displayName} className="w-full h-full rounded-full object-cover" />
          ) : (
            mentor.displayName.charAt(0)
          )}
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-gray-900 truncate" title={mentor.displayName}>
              {mentor.displayName}
            </h3>
            {matchScore > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg shrink-0">
                Match {matchScore}%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1 break-words">
            {mentor.bio}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-gray-700">
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span>{mentor.experienceYears} ans exp.</span>
        </div>
        {mentor.rating && (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-medium">{mentor.rating}</span>
            <span className="text-gray-500 text-xs">({mentor.totalSessions})</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-gray-400" />
          <span className="truncate">{mentor.languages.join(', ')}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {mentor.expertise.slice(0, 3).map(exp => (
          <span key={exp} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md truncate max-w-full">
            {exp}
          </span>
        ))}
      </div>

      {matchingReasons.length > 0 && (
        <div className="bg-indigo-50/50 rounded-xl p-3 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">Raisons du match</span>
          {matchingReasons.map((reason, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-indigo-900">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{reason}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        <div className={`px-3 py-1.5 rounded-lg border text-sm font-medium w-full sm:w-auto text-center ${getAvailabilityColor(mentor.availabilityStatus)}`}>
          <div className="flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4" />
            {getAvailabilityText(mentor.availabilityStatus)}
          </div>
        </div>
        
        <button
          onClick={() => onSelect(mentor.id)}
          disabled={mentor.availabilityStatus === 'unavailable'}
          className="flex-1 w-full min-h-[44px] bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Sélectionner ${mentor.displayName}`}
        >
          Voir les créneaux
        </button>
      </div>
    </div>
  );
};
