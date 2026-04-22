require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initSocket }   = require('./config/socket');
const seedAdmin = require('./seeders/admin.seeder');
const seedQuestions = require('./seeders/question.seeder');
const seedUsers          = require('./seeders/user.seeder');
const seedCodingQuestions = require('./seeders/coding-question.seeder');
require('./config/bull'); // initialize queues

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    await connectRedis();
    await seedAdmin();
    await seedQuestions();
    await seedUsers();
    await seedCodingQuestions();

    require('./workers/feedback.worker'); // khởi động Bull workers

    const httpServer = http.createServer(app);
    await initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
