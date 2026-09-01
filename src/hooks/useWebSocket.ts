import { useState, useEffect, useCallback } from 'react';
import { ConnectionStatus } from '../services/chatService';

export interface UseWebSocketResult {
  status: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook de connexion temps réel (WebSocket).
 * Gère le cycle de vie de la connexion.
 * SÉCURITÉ: Aucune URL hardcodée, aucun token dans le localStorage.
 */
export function useWebSocket(): UseWebSocketResult {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const connect = useCallback(() => {
    // Dans cette phase, sans infrastructure backend réelle, nous refusons 
    // de simuler une fausse connexion. Nous restons explicites.
    console.warn("[useWebSocket] MOCK / BLOCKED: Aucune infrastructure WebSocket configurée.");
    setStatus('error');
  }, []);

  const disconnect = useCallback(() => {
    setStatus('disconnected');
  }, []);

  useEffect(() => {
    // Nettoyage strict au démontage pour éviter les fuites de mémoire (Memory Leaks)
    let isMounted = true;
    
    if (isMounted) {
      // Intentionnellement vide en mode mock. 
      // Le backend réel instanciera le client WS ici.
    }

    return () => {
      isMounted = false;
      disconnect();
    };
  }, [disconnect]);

  return { status, connect, disconnect };
}
