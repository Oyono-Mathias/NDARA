import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Trash2, Plus, AlertCircle } from 'lucide-react';

export interface QuizOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  statement: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
  correctAnswerIds: string[];
  explanation?: string;
  points: number;
}

interface Props {
  question: Question;
  index: number;
  onChange: (q: Question) => void;
  onDelete: () => void;
}

export const QuestionBuilder: React.FC<Props> = ({ question, index, onChange, onDelete }) => {
  const handleAddOption = () => {
    const newOption: QuizOption = { id: Date.now().toString(), text: '' };
    onChange({ ...question, options: [...question.options, newOption] });
  };

  const handleUpdateOption = (optId: string, text: string) => {
    onChange({
      ...question,
      options: question.options.map(o => (o.id === optId ? { ...o, text } : o))
    });
  };

  const handleDeleteOption = (optId: string) => {
    onChange({
      ...question,
      options: question.options.filter(o => o.id !== optId),
      correctAnswerIds: question.correctAnswerIds.filter(id => id !== optId)
    });
  };

  const handleToggleCorrect = (optId: string) => {
    let newCorrect = [...question.correctAnswerIds];
    if (question.type === 'single') {
      newCorrect = [optId];
    } else {
      if (newCorrect.includes(optId)) {
        newCorrect = newCorrect.filter(id => id !== optId);
      } else {
        newCorrect.push(optId);
      }
    }
    onChange({ ...question, correctAnswerIds: newCorrect });
  };

  const isValid = 
    question.statement.trim() !== '' && 
    question.options.length >= 2 && 
    question.options.every(o => o.text.trim() !== '') &&
    question.correctAnswerIds.length > 0 &&
    question.points > 0;

  return (
    <Card className="border border-gray-200 shadow-sm mb-6 bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h3 className="font-bold text-lg text-gray-900">Question {index + 1}</h3>
          <Button variant="outline" onClick={onDelete} className="text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Énoncé de la question</label>
            <input 
              type="text" 
              value={question.statement}
              onChange={(e) => onChange({ ...question, statement: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Que signifie..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de question</label>
              <select 
                value={question.type}
                onChange={(e) => onChange({ ...question, type: e.target.value as 'single' | 'multiple', correctAnswerIds: [] })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="single">Choix unique</option>
                <option value="multiple">Choix multiple</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points attribués</label>
              <input 
                type="number" 
                min="1"
                value={question.points}
                onChange={(e) => onChange({ ...question, points: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              La sélection des bonnes réponses est préparatoire. La correction finale et le calcul des scores devront être validés côté serveur pour éviter toute triche.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Réponses (Sélectionnez la/les bonnes)</label>
            <div className="space-y-3">
              {question.options.map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggleCorrect(opt.id)}
                    className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${question.correctAnswerIds.includes(opt.id) ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`}
                    aria-label="Marquer comme bonne réponse"
                  >
                    {question.correctAnswerIds.includes(opt.id) && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </button>
                  <input 
                    type="text" 
                    value={opt.text}
                    onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                    className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${question.correctAnswerIds.includes(opt.id) ? 'border-green-300 bg-green-50/50' : 'border-gray-300'}`}
                    placeholder={`Option ${i + 1}`}
                  />
                  <button 
                    onClick={() => handleDeleteOption(opt.id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Supprimer l'option"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={handleAddOption} className="mt-3 w-full sm:w-auto border-dashed border-gray-300">
              <Plus className="w-4 h-4 mr-2" /> Ajouter une option
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Explication (Facultative)</label>
            <textarea 
              value={question.explanation || ''}
              onChange={(e) => onChange({ ...question, explanation: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
              placeholder="S'affiche après la réponse de l'étudiant..."
            />
          </div>

          {!isValid && (
            <div className="text-xs text-red-500 font-medium">
              Veuillez compléter l'énoncé, ajouter au moins 2 options, marquer une bonne réponse et définir les points.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
