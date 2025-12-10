import { io, Socket } from 'socket.io-client';

import type { DefaultEventsMap } from '@socket.io/component-emitter';

const SOCKET_URL = import.meta.env.VITE_BASE_URL;

// Just connect, no auth here
export const socket: Socket<DefaultEventsMap, DefaultEventsMap> = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});
