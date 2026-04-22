import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io({
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect',       () => console.log('[Socket] Connected:', socket.id));
  socket.on('connect_error', (err) => console.warn('[Socket] Error:', err.message));
  socket.on('disconnect',    (reason) => console.log('[Socket] Disconnected:', reason));

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
