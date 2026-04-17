const { createClient } = require('redis');

let client;

const connectRedis = async () => {
  client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  client.on('error', (err) => console.error('Redis error:', err));
  client.on('connect', () => console.log('Redis connected'));

  await client.connect();
  return client;
};

const getRedis = () => {
  if (!client) throw new Error('Redis not initialized');
  return client;
};

module.exports = { connectRedis, getRedis };
