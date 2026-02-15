import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    socketRef.current = io({
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      setMyId(socket.id);
      console.log('[SOCKET] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.warn('[SOCKET] Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    myId
  };
}
