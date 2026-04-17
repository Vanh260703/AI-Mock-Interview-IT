const mongoose = require('mongoose');
const { getRedis } = require('../config/redis');

const getHealthStatus = async (req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: 'disconnected',
      redis: 'disconnected',
    },
  };

  // MongoDB check
  const mongoState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  status.services.mongodb = mongoState === 1 ? 'connected' : 'disconnected';

  // Redis check
  try {
    const redis = getRedis();
    await redis.ping();
    status.services.redis = 'connected';
  } catch {
    status.services.redis = 'disconnected';
  }

  const allHealthy =
    status.services.mongodb === 'connected' && status.services.redis === 'connected';

  return res.status(allHealthy ? 200 : 503).json(status);
};

module.exports = { getHealthStatus };
