import { io } from 'socket.io-client';
import { SOCKET_URL } from './constants';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
