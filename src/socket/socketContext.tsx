import React, { createContext, useEffect } from 'react';

import { socket } from '@/socket/index';

export const SocketContext = createContext(socket);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        socket.emit('socket:connect_user', token);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
