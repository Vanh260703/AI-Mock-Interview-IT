const request = require('supertest');
const app     = require('../../src/app');
const { __mockQueue } = require('../mocks/bull');
const { createAuthUser }  = require('../helpers/auth.helper');
const { seedQuestions }   = require('../helpers/question.helper');

let token, userId;

beforeEach(async () => {
  ({ token, user: { _id: userId } } = await createAuthUser());
  await seedQuestions();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

// Helper tạo session
const createSession = (body = {}) =>
  request(app)
    .post('/api/interviews')
    .set(auth())
    .send({ level: 'intern', role: 'General', questionCount: 1, ...body });

describe('Interview Endpoints', () => {
  // ─── POST /api/interviews ──────────────────────────────────────────────────
  describe('POST /api/interviews', () => {
    it('should create session and return questions', async () => {
      const res = await createSession();

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('questions');
      expect(res.body.data.questions.length).toBeGreaterThan(0);
      expect(res.body.data.status).toBe('in_progress');
    });

    it('should map level=intern to difficulty=easy in settings', async () => {
      const res = await createSession({ level: 'intern' });

      expect(res.status).toBe(201);
      expect(res.body.data.settings.difficulty).toBe('easy');
      expect(res.body.data.settings.level).toBe('intern');
    });

    it('should map level=junior to difficulty=medium', async () => {
      const res = await createSession({ level: 'junior', role: 'FE' });

      expect(res.status).toBe(201);
      expect(res.body.data.settings.difficulty).toBe('medium');
    });

    it('should map level=senior to difficulty=hard', async () => {
      const res = await createSession({ level: 'senior', role: 'FS' });

      expect(res.status).toBe(201);
      expect(res.body.data.settings.difficulty).toBe('hard');
    });

    it('should return 400 when level is missing', async () => {
      const res = await request(app)
        .post('/api/interviews')
        .set(auth())
        .send({ role: 'General' });

      expect(res.status).toBe(400);
    });

    it('should filter questions by role', async () => {
      const res = await createSession({ role: 'BE', level: 'fresher' });

      expect(res.status).toBe(201);
      // Mỗi question trả về phải có role=BE
      res.body.data.questions.forEach((q) => expect(q.role).toBe('BE'));
    });

    it('should store role and level in session settings', async () => {
      const res = await createSession({ role: 'FE', level: 'junior' });

      expect(res.body.data.settings.role).toBe('FE');
      expect(res.body.data.settings.level).toBe('junior');
    });
  });

  // ─── GET /api/interviews ───────────────────────────────────────────────────
  describe('GET /api/interviews', () => {
    it('should return user sessions with pagination', async () => {
      await createSession();
      await createSession();

      const res = await request(app).get('/api/interviews').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body).toHaveProperty('pagination');
    });

    it('should only return sessions of the authenticated user', async () => {
      await createSession();

      // Tạo user khác và session của họ
      const { token: otherToken } = await createAuthUser();
      await request(app)
        .post('/api/interviews')
        .set({ Authorization: `Bearer ${otherToken}` })
        .send({ level: 'intern', role: 'General', questionCount: 1 });

      const res = await request(app).get('/api/interviews').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  // ─── POST /api/interviews/:id/answers ─────────────────────────────────────
  describe('POST /api/interviews/:id/answers', () => {
    it('should save answer and ENQUEUE FeedbackJob to Bull', async () => {
      const sessionRes = await createSession();
      const sessionId  = sessionRes.body.data._id;
      const questionId = sessionRes.body.data.questions[0]._id;

      const res = await request(app)
        .post(`/api/interviews/${sessionId}/answers`)
        .set(auth())
        .send({ questionId, content: 'Đây là câu trả lời của tôi', duration: 60, status: 'submitted' });

      expect(res.status).toBe(200);
      expect(res.body.data.answer).toHaveProperty('_id');

      // *** KEY TEST: FeedbackJob phải được enqueue ***
      expect(__mockQueue.add).toHaveBeenCalledWith(
        'FeedbackJob',
        expect.objectContaining({ answerId: expect.anything(), sessionId: expect.anything() }),
        expect.any(Object)
      );
    });

    it('should NOT enqueue FeedbackJob when status=skipped', async () => {
      const sessionRes = await createSession();
      const sessionId  = sessionRes.body.data._id;
      const questionId = sessionRes.body.data.questions[0]._id;

      await request(app)
        .post(`/api/interviews/${sessionId}/answers`)
        .set(auth())
        .send({ questionId, content: '', duration: 0, status: 'skipped' });

      expect(__mockQueue.add).not.toHaveBeenCalledWith('FeedbackJob', expect.anything(), expect.anything());
    });

    it('should return 400 when questionId is missing', async () => {
      const sessionRes = await createSession();
      const res = await request(app)
        .post(`/api/interviews/${sessionRes.body.data._id}/answers`)
        .set(auth())
        .send({ content: 'no question id' });

      expect(res.status).toBe(400);
    });

    it('should return 400 when question does not belong to session', async () => {
      const sessionRes = await createSession();
      const res = await request(app)
        .post(`/api/interviews/${sessionRes.body.data._id}/answers`)
        .set(auth())
        .send({ questionId: '000000000000000000000000', content: 'test' });

      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /api/interviews/:id/complete ─────────────────────────────────────
  describe('PUT /api/interviews/:id/complete', () => {
    it('should mark session as completed', async () => {
      const sessionRes = await createSession();
      const sessionId  = sessionRes.body.data._id;

      const res = await request(app)
        .put(`/api/interviews/${sessionId}/complete`)
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.session.status).toBe('completed');
      expect(res.body.data.session.completedAt).toBeTruthy();
    });

    it('should return 400 when session is already completed', async () => {
      const sessionRes = await createSession();
      const sessionId  = sessionRes.body.data._id;

      await request(app).put(`/api/interviews/${sessionId}/complete`).set(auth());
      const res = await request(app).put(`/api/interviews/${sessionId}/complete`).set(auth());

      expect(res.status).toBe(400);
    });

    it('should return 404 for another user session', async () => {
      const sessionRes = await createSession();
      const sessionId  = sessionRes.body.data._id;
      const { token: otherToken } = await createAuthUser();

      const res = await request(app)
        .put(`/api/interviews/${sessionId}/complete`)
        .set({ Authorization: `Bearer ${otherToken}` });

      expect(res.status).toBe(404);
    });
  });
});
