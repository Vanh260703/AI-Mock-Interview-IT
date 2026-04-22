const { Server }       = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Redis Adapter — cần 2 client riêng (pub + sub)
  const pubClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log('[Socket.IO] Redis adapter attached');

  // Auth middleware — verify JWT từ handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    // Mỗi user join vào room riêng của mình
    socket.join(`user_${userId}`);
    console.log(`[Socket.IO] Connected: userId=${userId} socketId=${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected: userId=${userId} reason=${reason}`);
    });
  });

  return io;
};

// Dùng trong controllers để emit event
const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initSocket, getIO };
