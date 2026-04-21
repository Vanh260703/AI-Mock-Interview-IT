const request = require('supertest');
const app     = require('../../src/app');
const User    = require('../../src/models/user.model');

describe('Auth Endpoints', () => {
  // ─── POST /api/auth/register ───────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'newuser',
        email:    'new@test.com',
        password: 'Test@123456',
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/verify/i);
    });

    it('should return 409 when email already exists', async () => {
      await User.create({
        username: 'existing', email: 'dup@test.com', password: 'Test@123456', isEmailVerified: true,
      });

      const res = await request(app).post('/api/auth/register').send({
        username: 'another', email: 'dup@test.com', password: 'Test@123456',
      });

      expect(res.status).toBe(409);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'x@test.com' });
      expect(res.status).toBe(400);
    });
  });

  // ─── POST /api/auth/login ──────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'loginuser', email: 'login@test.com',
        password: 'Test@123456', isEmailVerified: true,
      });
    });

    it('should login and return accessToken', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: 'login@test.com', password: 'Test@123456',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
    });

    it('should return 401 with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: 'login@test.com', password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
    });

    it('should return 403 when email not verified', async () => {
      await User.create({
        username: 'unverified', email: 'unverified@test.com',
        password: 'Test@123456', isEmailVerified: false,
      });

      const res = await request(app).post('/api/auth/login').send({
        identifier: 'unverified@test.com', password: 'Test@123456',
      });

      expect(res.status).toBe(403);
    });

    it('should return 401 when user not found', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: 'notfound@test.com', password: 'Test@123456',
      });

      expect(res.status).toBe(401);
    });
  });

  // ─── Protected route guard ─────────────────────────────────────────────────
  describe('Protected route', () => {
    it('should return 401 when no token provided', async () => {
      const res = await request(app).get('/api/interviews');
      expect(res.status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/interviews')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });
  });
});
