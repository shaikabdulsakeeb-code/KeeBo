import { io } from 'socket.io-client';
import { API_BASE_URL } from './constants';

// We derive the backend URL from the API_BASE_URL (removing /api from the end)
const backendUrl = API_BASE_URL.replace('/api', '');

export const socket = io(backendUrl, {
  autoConnect: false, // We will connect manually when the user logs in
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
