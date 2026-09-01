import React, { useState, KeyboardEvent } from 'react';
import { Send, AlertCircle } from 'lucide-react';

export interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    try {
      // Nous laissons le hook orchestrer l'envoi et générer le faux succès/échec
      await onSendMessage(trimmed);
      setContent(''); // Vider le champ localement
    } catch (err) {
      console.error("Input send error", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Entrée pour envoyer (sans majuscule pour sauter une ligne)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4">
      {disabled && (
        <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 mb-2">
          <AlertCircle className="w-4 h-4 mr-1" />
          Messagerie momentanément indisponible (hors ligne)
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          placeholder={disabled ? "Connexion perdue..." : "Écrivez votre message..."}
          className="flex-1 max-h-32 min-h-[44px] resize-none overflow-y-auto rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          rows={1}
          aria-label="Zone de saisie du message"
        />
        <button
          onClick={handleSend}
          disabled={disabled || isSending || !content.trim()}
          className="flex-shrink-0 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Envoyer le message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
