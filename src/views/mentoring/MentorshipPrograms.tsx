import React, { useEffect, useState } from 'react';
import { useMentoring } from '../../hooks/useMentoring';
import { MentorshipProgram } from '../../services/mentoringService';
import { MentorMatching } from './MentorMatching';
import { BookOpen, Clock, Target, Users, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export const MentorshipPrograms: React.FC = () => {
  const { status, error, programs, loadPrograms } = useMentoring();
  const [selectedProgram, setSelectedProgram] = useState<MentorshipProgram | null>(null);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  if (selectedProgram) {
    return <MentorMatching program={selectedProgram} onBack={() => setSelectedProgram(null)} />;
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto gap-8 p-4 sm:p-6">
      
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
          Programmes de Mentorat
        </h1>
        <p className="text-gray-600 max-w-2xl text-lg">
          Accélérez votre carrière en vous faisant accompagner par des experts de l'industrie. 
          Découvrez nos programmes sur mesure.
        </p>
      </div>

      {status === 'loading_programs' && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p>Chargement des programmes...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
          <AlertCircle className="w-8 h-8" />
          <p className="font-medium">{error}</p>
          <button 
            onClick={loadPrograms}
            className="mt-2 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 min-h-[44px]"
          >
            Réessayer
          </button>
        </div>
      )}

      {status === 'empty' && (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 p-12 rounded-2xl text-center">
          <p>Aucun programme de mentorat n'est disponible pour le moment.</p>
        </div>
      )}

      {(status === 'idle' || status === 'success') && programs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map(program => (
            <div 
              key={program.id}
              className="flex flex-col bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6 sm:p-8 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg">
                    {program.domain}
                  </span>
                  {program.isMock && (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded">
                      Mock
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3">
                    {program.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{program.durationWeeks} semaines</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{program.format}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{program.sessionsCount} sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{program.level}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Tarif</div>
                  <div className="text-2xl font-black text-gray-900">
                    {program.price === 0 ? 'Gratuit' : `${program.price} ${program.currency}`}
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedProgram(program)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                  Trouver un mentor
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
