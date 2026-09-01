import React, { useState } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface ForumPostProps {
  topicId: string;
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const ForumPost: React.FC<ForumPostProps> = ({ onSubmit, disabled = false }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      setError("Le message ne peut pas être vide.");
      return;
    }

    if (trimmedContent.length > 3000) {
      setError("Le message est trop long (maximum 3000 caractères).");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(trimmedContent);
      setContent(''); // Clear on real success
    } catch (err) {
      let errorMessage = "Une erreur est survenue.";
      if (err instanceof Error) {
        if (err.message.includes('BACKEND_NOT_CONNECTED')) {
          errorMessage = "Erreur : Le service Backend n'est pas connecté. Action annulée.";
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Répondre à la discussion</h3>
      
      {disabled ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-gray-500 rounded-lg text-sm text-center border border-gray-200 dark:border-gray-700">
          Cette discussion est verrouillée. Vous ne pouvez plus y répondre.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
              placeholder="Rédigez votre réponse ici..."
              className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white min-h-[120px] max-h-[300px]"
              maxLength={3000}
              aria-label="Contenu de votre réponse"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {content.length}/3000
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Envoi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Publier la réponse
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
