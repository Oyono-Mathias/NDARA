import React, { useState } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Plus, Save, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { QuestionBuilder, Question } from './QuestionBuilder';

export const QuizEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      statement: '',
      type: 'single',
      options: [
        { id: Date.now().toString() + '-1', text: '' },
        { id: Date.now().toString() + '-2', text: '' }
      ],
      correctAnswerIds: [],
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    setQuestions(questions.map(q => q.id === updatedQ.id ? updatedQ : q));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const isQuizValid = 
    title.trim() !== '' && 
    questions.length > 0 && 
    questions.every(q => 
      q.statement.trim() !== '' && 
      q.options.length >= 2 && 
      q.options.every(o => o.text.trim() !== '') &&
      q.correctAnswerIds.length > 0 &&
      q.points > 0
    );

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const handleSave = () => {
    if (!isQuizValid) return;
    setIsSaving(true);
    setStatusMsg(null);
    
    // Mocking an async save intention
    setTimeout(() => {
      setIsSaving(false);
      setStatusMsg({
        type: 'success',
        text: 'Intention de sauvegarde préparée — validation serveur requise.'
      });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Éditeur de Quiz
          </h1>
          <p className="text-sm text-gray-500 mt-1">Créez et configurez vos évaluations.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !isQuizValid}
          className="w-full sm:w-auto px-6 py-3"
        >
          {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Sauvegarder le Quiz
        </Button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{statusMsg.text}</p>
        </div>
      )}

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du quiz</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
              placeholder="Ex: Évaluation finale - Module 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Facultative)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
              placeholder="Instructions pour les étudiants..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm font-medium text-gray-600 px-2">
        <span>{questions.length} question(s)</span>
        <span>Total : {totalPoints} point(s)</span>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <QuestionBuilder 
            key={q.id}
            question={q}
            index={index}
            onChange={handleUpdateQuestion}
            onDelete={() => handleDeleteQuestion(q.id)}
          />
        ))}
      </div>

      <Button 
        variant="outline" 
        onClick={handleAddQuestion} 
        disabled={isSaving}
        className="w-full py-4 border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" /> Ajouter une question
      </Button>
    </div>
  );
};
