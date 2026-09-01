import React, { useEffect, useState, useRef } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { ArrowLeft, Clock, Send, ShieldAlert, CheckCircle } from 'lucide-react';

export const TicketDetail: React.FC<{ ticketId: string, onBack?: () => void }> = ({ ticketId, onBack }) => {
  const { selectedTicket, messages, loading, error, fetchTicketDetail, sendMessage, changeStatus, submitting } = useTickets();
  const [reply, setReply] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanup = fetchTicketDetail(ticketId);
    return () => { cleanup.then(f => f && f()); };
  }, [ticketId, fetchTicketDetail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const success = await sendMessage(ticketId, reply);
    if (success) {
      setReply('');
    }
  };

  const handleMarkResolved = async () => {
    await changeStatus(ticketId, 'resolved');
  };

  if (loading && !selectedTicket) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 flex flex-col gap-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  if (error || !selectedTicket) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Erreur de chargement</h2>
          <p className="text-red-600 dark:text-red-300 mt-2">{error || "Ticket introuvable"}</p>
          {onBack && (
            <button onClick={onBack} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg min-h-[44px]">Retour</button>
          )}
        </div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'pending': return 'En attente';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)] lg:h-auto">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8 pb-4 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 sticky top-0">
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Retour">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate" title={selectedTicket.subject}>
              {selectedTicket.subject}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${selectedTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
              {getStatusLabel(selectedTicket.status)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center"><span className="font-medium mr-1">ID:</span> {selectedTicket.id}</span>
          <span className="flex items-center"><span className="font-medium mr-1">Catégorie:</span> {selectedTicket.category}</span>
          <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {new Date(selectedTicket.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8 space-y-6 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg) => {
          const isMe = msg.senderRole === 'student'; // Dans ce mock, l'étudiant est "Moi"
          return (
            <div key={msg.id} className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1 px-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {isMe ? 'Vous' : (msg.senderRole === 'support' ? 'Support Ndara' : 'Instructeur')}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`p-4 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700 rounded-bl-sm'}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Area */}
      {selectedTicket.status !== 'closed' && (
        <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          {selectedTicket.status === 'resolved' ? (
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium">Ce ticket est marqué comme résolu.</p>
              <button 
                onClick={() => changeStatus(ticketId, 'open')}
                disabled={submitting}
                className="mt-3 text-sm text-primary hover:underline font-medium min-h-[44px] px-4"
              >
                Rouvrir le ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleReply} className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Écrivez votre réponse ici..."
                  disabled={submitting}
                  className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none min-h-[50px] max-h-[150px] dark:text-white"
                  rows={2}
                  maxLength={2000}
                ></textarea>
                <button
                  type="submit"
                  disabled={!reply.trim() || submitting}
                  className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 min-h-[50px] min-w-[50px] flex items-center justify-center"
                  aria-label="Envoyer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{reply.length}/2000 caractères</span>
                <button 
                  type="button"
                  onClick={handleMarkResolved}
                  disabled={submitting}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[44px] px-2 -mr-2"
                >
                  Marquer comme résolu
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
