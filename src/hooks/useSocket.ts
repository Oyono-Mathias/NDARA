import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      // Connect to the same host using window.location
      const url = window.location.origin;
      socketInstance = io(url, {
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });
      
      setSocket(socketInstance);
    } // else we reuse existing

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    
    setIsConnected(socketInstance.connected);

    return () => {
      if (socketInstance) {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
      }
    };
  }, []);

  return { socket, isConnected };
}
