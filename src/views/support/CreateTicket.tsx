import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { TicketCategory, TicketPriority } from '../../services/ticketService';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const CreateTicket: React.FC<{ onBack?: () => void, onSuccess?: (ticketId: string) => void }> = ({ onBack, onSuccess }) => {
  const { createTicket, submitting, error } = useTickets();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('other');
  const [priority, setPriority] = useState<TicketPriority>('low');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!subject.trim()) {
      setValidationError("Le sujet est obligatoire.");
      return;
    }
    if (description.trim().length < 10) {
      setValidationError("La description doit faire au moins 10 caractères.");
      return;
    }

    const newTicket = await createTicket({
      subject,
      description,
      category,
      priority
    });

    if (newTicket && onSuccess) {
      onSuccess(newTicket.id);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Retour">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau Ticket</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Soumettez votre demande à notre équipe support.</p>
        </div>
      </div>

      {(error || validationError) && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-800 dark:text-red-400">{validationError || error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
            Sujet du ticket <span className="text-red-500">*</span>
          </label>
          <input 
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={submitting}
            placeholder="Ex: Problème d'accès à la plateforme"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px] dark:text-white disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as TicketCategory)}
              disabled={submitting}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px] dark:text-white disabled:opacity-50"
            >
              <option value="account">Compte & Accès</option>
              <option value="course">Contenu & Cours</option>
              <option value="payment">Paiement & Facturation</option>
              <option value="technical">Problème Technique</option>
              <option value="certificate">Certificats</option>
              <option value="other">Autre demande</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Priorité
            </label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as TicketPriority)}
              disabled={submitting}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px] dark:text-white disabled:opacity-50"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
            Description détaillée <span className="text-red-500">*</span>
          </label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={submitting}
            rows={5}
            placeholder="Décrivez votre problème le plus précisément possible..."
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-y min-h-[120px] dark:text-white disabled:opacity-50"
          ></textarea>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors min-h-[44px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? 'Envoi en cours...' : 'Soumettre le ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};
