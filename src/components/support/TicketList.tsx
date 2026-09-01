import React from 'react';
import { Ticket } from '../../services/ticketService';
import { TicketCard } from './TicketCard';
import { LifeBuoy } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  onTicketClick: (id: string) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, loading, onTicketClick }) => {
  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!loading && tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 text-center min-h-[250px]">
        <LifeBuoy className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Aucun ticket</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Vous n'avez aucun ticket correspondant à ces critères.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} onClick={onTicketClick} />
      ))}
    </div>
  );
};
