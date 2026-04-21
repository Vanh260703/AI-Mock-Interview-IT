const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Env vars cho test (phải set trước khi app load)
process.env.NODE_ENV            = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test_access_secret_key_32chars!!';
process.env.REFRESH_TOKEN_SECRET= 'test_refresh_secret_key_32chars!';
process.env.ACCESS_TOKEN_EXPIRES = '1h';
process.env.REFRESH_TOKEN_EXPIRES = '7d';
process.env.CLIENT_URL          = 'http://localhost:8080';
process.env.GROQ_API_KEY        = 'test_groq_key';
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY  = 'test_api_key';
process.env.CLOUDINARY_API_SECRET = 'test_api_secret';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Xóa toàn bộ data sau mỗi test để tránh pollution
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
