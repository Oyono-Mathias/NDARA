import { useState, useCallback, useEffect } from 'react';

export type SocketState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface SocketMessage<T = unknown> {
  type: string;
  payload: T;
}

export const useSocket = () => {
  const [status, setStatus] = useState<SocketState>('disconnected');
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);

  // MOCK IMPLEMENTATION
  // In a real application, connection requires a secure token validated backend-side.
  // Never hardcode API keys or socket secrets here.
  const connect = useCallback(() => {
    setStatus('connecting');
    const timer = setTimeout(() => {
      setStatus('connected');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const disconnect = useCallback(() => {
    setStatus('disconnected');
    setLastMessage(null);
  }, []);

  useEffect(() => {
    // Force cleanup on unmount
    return () => {
      if (status === 'connected' || status === 'connecting') {
        setStatus('disconnected');
      }
    };
  }, [status]);

  return { status, connect, disconnect, lastMessage };
};
