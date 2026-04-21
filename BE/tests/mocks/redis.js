// Mock Redis — in-memory store, export cả getRedis lẫn connectRedis
const store = new Map();

const mockClient = {
  get:    jest.fn(async (key) => store.get(key) ?? null),
  set:    jest.fn(async (key, value) => { store.set(key, value); return 'OK'; }),
  del:    jest.fn(async (...keys) => { keys.flat().forEach((k) => store.delete(k)); return 1; }),
  ttl:    jest.fn(async () => 30),
  expire: jest.fn(async () => 1),
};

const connectRedis = jest.fn().mockResolvedValue(undefined);
const getRedis     = jest.fn(() => mockClient);

afterEach(() => store.clear());

module.exports = { connectRedis, getRedis, redisClient: mockClient };
