import { useContext, useEffect } from 'react';

import { SocketContext } from '@/socket/socketContext';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const useSocketEmit = () => {
  const socket = useSocket();

  return (event: string, payload?: unknown) => {
    if (socket.connected) {
      socket.emit(event, payload);
    } else {
      console.error(`Socket not connected. Event ${event} not emitted.`);
    }
  };
};

export const useSocketListener = <T>(event: string, handler: (data: T) => void) => {
  const socket = useSocket();

  useEffect(() => {
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
};
