import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { X, Clock } from 'lucide-react';

export const QuizPlayer: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Mock quiz data
  const quiz = {
    title: 'Test de connaissances : React Hooks',
    questions: [
      { id: 1, text: 'À quoi sert le hook useState ?', options: ['Gérer le cycle de vie', 'Gérer l\'état local', 'Faire des appels API', 'Créer des contextes'] },
      { id: 2, text: 'Quel hook remplace componentDidMount ?', options: ['useContext', 'useReducer', 'useEffect', 'useMemo'] }
    ]
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Fin du quiz
      navigate('/results', { state: { score: 100, total: 100 } });
    }
  };

  const question = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => window.history.back()} className="p-2 text-gray-500 hover:text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200">
          <X className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-gray-900 text-sm sm:text-base hidden sm:block">{quiz.title}</h1>
        <div className="flex items-center text-orange-600 font-bold bg-orange-50 px-3 py-1.5 rounded-full">
          <Clock className="w-4 h-4 mr-1.5" /> 14:59
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <div className="bg-blue-600 h-1.5 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col">
        <div className="mb-8">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 block">
            Question {currentQuestionIndex + 1} sur {quiz.questions.length}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {question.text}
          </h2>
        </div>

        <div className="space-y-3 flex-1">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[64px] ${
                selectedOption === index 
                  ? 'border-blue-600 bg-blue-50 text-blue-900' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 ${
                  selectedOption === index ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {selectedOption === index && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                </div>
                <span className="text-base sm:text-lg font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-8 mt-auto sticky bottom-4">
          <Button 
            variant="primary" 
            fullWidth 
            className="py-6 text-lg rounded-2xl shadow-lg"
            disabled={selectedOption === null}
            onClick={handleNext}
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </div>
    </div>
  );
};
