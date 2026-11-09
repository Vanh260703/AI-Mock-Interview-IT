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

  // ─── POST /api/auth/refresh-token ──────────────────────────────────────────
  describe('POST /api/auth/refresh-token', () => {
    const getRefreshCookie = (res) =>
      (res.headers['set-cookie'] || []).find((c) => c.startsWith('refreshToken='))?.split(';')[0];

    const login = async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: 'refresh@test.com', password: 'Test@123456',
      });
      return getRefreshCookie(res);
    };

    const refresh = (cookie) => request(app).post('/api/auth/refresh-token').set('Cookie', cookie);

    beforeEach(async () => {
      await User.create({
        username: 'refreshuser', email: 'refresh@test.com',
        password: 'Test@123456', isEmailVerified: true,
      });
    });

    it('should rotate the refresh token and return a new accessToken', async () => {
      const cookie = await login();
      const res = await refresh(cookie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      const newCookie = getRefreshCookie(res);
      expect(newCookie).toBeDefined();
      expect(newCookie).not.toBe(cookie);

      expect((await refresh(newCookie)).status).toBe(200);
    });

    it('should accept the previous token within the grace window without rotating again', async () => {
      const cookie = await login();
      await refresh(cookie);

      const res = await refresh(cookie);
      expect(res.status).toBe(200);
      expect(getRefreshCookie(res)).toBeUndefined();
    });

    it('should revoke the session when an old token is reused after grace', async () => {
      const t1 = await login();
      const t2 = getRefreshCookie(await refresh(t1));
      const t3 = getRefreshCookie(await refresh(t2));

      // t1 đã ra khỏi grace (prev hiện là t2) → reuse
      expect((await refresh(t1)).status).toBe(401);
      // Toàn bộ phiên bị thu hồi, kể cả token mới nhất
      expect((await refresh(t3)).status).toBe(401);
    });

    it('should reject a token from a replaced session without revoking the new one', async () => {
      const oldSession = await login();
      const newSession = await login();

      expect((await refresh(oldSession)).status).toBe(401);
      expect((await refresh(newSession)).status).toBe(200);
    });

    it('should reject refresh after logout', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        identifier: 'refresh@test.com', password: 'Test@123456',
      });
      const cookie = getRefreshCookie(loginRes);

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .set('Cookie', cookie);

      expect((await refresh(cookie)).status).toBe(401);
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
