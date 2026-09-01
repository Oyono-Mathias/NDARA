import React, { useState } from 'react';
import { Check, CheckCircle2, AlertCircle, Info, RefreshCw, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { AppNotification } from '../../services/notificationService';

export const NotificationCenter: React.FC = () => {
  const { notifications, loading, error, refresh, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'unread' ? n.status !== 'read' : true
  );

  const renderIcon = (category: string) => {
    switch (category) {
      case 'transaction':
      case 'payment':
      case 'wallet':
      case 'commission':
        return <div className="p-2 bg-green-100 text-green-600 rounded-full"><CheckCircle2 className="w-5 h-5" /></div>;
      case 'security':
        return <div className="p-2 bg-red-100 text-red-600 rounded-full"><AlertCircle className="w-5 h-5" /></div>;
      default:
        return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><Info className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden flex flex-col h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
        <div className="flex gap-2">
          <button 
            onClick={refresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Rafraîchir les notifications"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => markAllAsRead()}
            className="p-2 text-primary hover:text-primary-dark rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tout marquer comme lu"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => setFilter('all')}
          className={`flex-1 py-3 text-sm font-medium min-h-[44px] ${filter === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Toutes
        </button>
        <button 
          onClick={() => setFilter('unread')}
          className={`flex-1 py-3 text-sm font-medium min-h-[44px] ${filter === 'unread' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Non lues
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <X className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Impossible de charger les notifications</p>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
              <BellOffIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune notification à afficher</p>
          </div>
        ) : (
          filteredNotifications.map((notif: AppNotification) => (
            <div 
              key={notif.id}
              className={`p-3 rounded-xl border transition-all ${
                notif.status !== 'read' 
                  ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' 
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {renderIcon(notif.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${notif.status !== 'read' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notif.payload.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
                    {notif.payload.body}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {notif.status !== 'read' && (
                  <button 
                    onClick={() => markAsRead(notif.id)}
                    className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors min-h-[44px] min-w-[44px] self-start flex justify-center items-center"
                    aria-label="Marquer comme lu"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Helper Icon for Empty State
const BellOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
    <path d="M18 8a6 6 0 0 0-9.33-5"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);
