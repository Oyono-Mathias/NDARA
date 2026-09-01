import { useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../services/notificationService';
import { NotificationRoutes } from '../routes/notificationRoutes';

export interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

/**
 * Hook central de gestion des notifications.
 * Gère le cycle de vie réseau sans polluer inutilement et nettoie ses dépendances.
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Exécution parallèle des requêtes pour optimisation
      const [fetchedNotifications, count] = await Promise.all([
        NotificationRoutes.fetchNotifications(20, 0),
        NotificationRoutes.fetchUnreadCount()
      ]);
      
      setNotifications(fetchedNotifications);
      setUnreadCount(Math.max(0, count)); // Ne jamais avoir un nombre négatif
    } catch (err: any) {
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Nettoyage et récupération initiale
  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      fetchState();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchState]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const success = await NotificationRoutes.markAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, status: 'read', readAt: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error("Failed to mark as read", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const success = await NotificationRoutes.markAllAsRead();
      if (success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, status: 'read', readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error("Failed to mark all as read", err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchState,
    markAsRead,
    markAllAsRead
  };
}
