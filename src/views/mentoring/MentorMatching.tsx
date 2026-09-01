import React, { useEffect, useState } from 'react';
import { useMentoring } from '../../hooks/useMentoring';
import { MentorshipProgram } from '../../services/mentoringService';
import { MentorCard } from '../../components/mentoring/MentorCard';
import { SessionBooking } from '../../components/mentoring/SessionBooking';
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';

interface MentorMatchingProps {
  program: MentorshipProgram;
  onBack: () => void;
}

export const MentorMatching: React.FC<MentorMatchingProps> = ({ program, onBack }) => {
  const { status, error, mentorMatches, searchMentors } = useMentoring();
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  // Search criteria state
  const [domain, setDomain] = useState(program.domain);
  const [language, setLanguage] = useState('');

  // Initial search
  useEffect(() => {
    searchMentors(domain, language);
  }, [domain, language, searchMentors]);

  if (selectedMentorId) {
    const selectedMatch = mentorMatches.find(m => m.mentor.id === selectedMentorId);
    if (selectedMatch) {
      return (
        <SessionBooking 
          mentor={selectedMatch.mentor} 
          program={program} 
          onBack={() => setSelectedMentorId(null)} 
        />
      );
    }
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-6">
      <div className="flex flex-col gap-2">
        <button 
          onClick={onBack}
          className="self-start text-gray-500 hover:text-gray-900 font-medium py-2 min-h-[44px]"
        >
          &larr; Retour aux programmes
        </button>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
          Trouvez votre mentor
        </h2>
        <p className="text-gray-600">
          Pour le programme : <strong className="text-indigo-700">{program.title}</strong>
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Domaine d'expertise
          </label>
          <input 
            type="text" 
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Ex: React, Design..."
            className="w-full min-h-[44px] px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Search className="w-4 h-4" /> Langue
          </label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full min-h-[44px] px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
          >
            <option value="">Toutes les langues</option>
            <option value="Français">Français</option>
            <option value="Anglais">Anglais</option>
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex flex-col gap-4">
        {status === 'loading_mentors' && (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p>Recherche des meilleurs profils...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {status === 'empty' && (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 p-8 rounded-2xl text-center">
            <p>Aucun mentor ne correspond à vos critères actuels.</p>
          </div>
        )}

        {status === 'idle' && mentorMatches.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mentorMatches.map((match) => (
              <MentorCard 
                key={match.mentor.id}
                match={match}
                onSelect={setSelectedMentorId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
