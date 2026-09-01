import React from 'react';
import { Ticket } from '../../services/ticketService';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick: (id: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'pending': return 'En attente';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high' || priority === 'urgent') {
      return <AlertCircle className="w-3.5 h-3.5 text-red-500 mr-1" />;
    }
    return null;
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <button 
      onClick={() => onClick(ticket.id)}
      className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-gray-900 min-h-[44px]"
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{ticket.subject}</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(ticket.status)}`}>
          {getStatusLabel(ticket.status)}
        </span>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {ticket.description}
      </p>
      
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center">
            {getPriorityIcon(ticket.priority)}
            {ticket.priority === 'urgent' ? 'Urgent' : ticket.priority === 'high' ? 'Haute' : ticket.category}
          </span>
          <span className="flex items-center">
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            {ticket.messagesCount} msg
          </span>
        </div>
        <span className="flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1" />
          {formatDate(ticket.updatedAt)}
        </span>
      </div>
    </button>
  );
};
