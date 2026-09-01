import React, { useEffect, useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { TicketList } from '../../components/support/TicketList';
import { TicketStatus } from '../../services/ticketService';
import { Plus, Search, AlertCircle, RefreshCw } from 'lucide-react';

export const SupportTickets: React.FC<{ onCreateClick?: () => void, onTicketClick?: (id: string) => void }> = ({ onCreateClick, onTicketClick }) => {
  const { tickets, loading, error, fetchTickets } = useTickets();
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const cleanup = fetchTickets();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [fetchTickets]);

  const filteredTickets = tickets.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez vos tickets d'assistance</p>
        </div>
        <button 
          onClick={onCreateClick}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Nouveau Ticket
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Erreur de chargement</h3>
            <p className="text-sm text-red-700 dark:text-red-500 mt-1">{error}</p>
          </div>
          <button onClick={fetchTickets} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg min-h-[44px]">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher un ticket..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px] dark:text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {(['all', 'open', 'pending', 'resolved', 'closed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                filterStatus === status 
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'open' ? 'Ouverts' : status === 'pending' ? 'En attente' : status === 'resolved' ? 'Résolus' : 'Fermés'}
            </button>
          ))}
        </div>
      </div>

      <TicketList 
        tickets={filteredTickets} 
        loading={loading} 
        onTicketClick={(id) => onTicketClick && onTicketClick(id)} 
      />
    </div>
  );
};
