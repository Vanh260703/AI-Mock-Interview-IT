const Bull = require('bull');

const bullConfig = {
  redis: {
    host: process.env.BULL_REDIS_HOST || 'localhost',
    port: parseInt(process.env.BULL_REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

const createQueue = (name) => {
  const queue = new Bull(name, bullConfig);

  queue.on('completed', (job) => {
    console.log(`[Bull] Job ${job.id} in queue "${name}" completed`);
  });

  queue.on('failed', (job, err) => {
    console.error(`[Bull] Job ${job.id} in queue "${name}" failed:`, err.message);
  });

  return queue;
};

// Example queues — add more as needed
const queues = {
  interviewQueue: createQueue('interview'),
};

module.exports = { createQueue, queues };
