require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const seedAdmin = require('./seeders/admin.seeder');
const seedQuestions = require('./seeders/question.seeder');
require('./config/bull'); // initialize queues

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    await connectRedis();
    await seedAdmin();
    await seedQuestions();

    require('./workers/feedback.worker'); // khởi động Bull workers

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
