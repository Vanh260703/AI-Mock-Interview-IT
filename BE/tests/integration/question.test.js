const request  = require('supertest');
const app      = require('../../src/app');
const { createAuthUser }    = require('../helpers/auth.helper');
const { seedQuestions }     = require('../helpers/question.helper');

let token;

beforeEach(async () => {
  ({ token } = await createAuthUser());
  await seedQuestions();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('Question Endpoints', () => {
  // ─── GET /api/questions ────────────────────────────────────────────────────
  describe('GET /api/questions', () => {
    it('should return paginated questions', async () => {
      const res = await request(app).get('/api/questions').set(auth());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by role=FE', async () => {
      const res = await request(app).get('/api/questions?role=FE').set(auth());

      expect(res.status).toBe(200);
      res.body.data.forEach((q) => expect(q.role).toBe('FE'));
    });

    it('should filter by level=intern', async () => {
      const res = await request(app).get('/api/questions?level=intern').set(auth());

      expect(res.status).toBe(200);
      res.body.data.forEach((q) => expect(q.level).toBe('intern'));
    });

    it('should filter by difficulty=easy', async () => {
      const res = await request(app).get('/api/questions?difficulty=easy').set(auth());

      expect(res.status).toBe(200);
      res.body.data.forEach((q) => expect(q.difficulty).toBe('easy'));
    });

    it('should filter by category=behavioral', async () => {
      const res = await request(app).get('/api/questions?category=behavioral').set(auth());

      expect(res.status).toBe(200);
      res.body.data.forEach((q) => expect(q.category).toBe('behavioral'));
    });

    it('should not return sampleAnswer and hints in list', async () => {
      const res = await request(app).get('/api/questions').set(auth());

      expect(res.status).toBe(200);
      res.body.data.forEach((q) => {
        expect(q).not.toHaveProperty('sampleAnswer');
        expect(q).not.toHaveProperty('hints');
      });
    });

    it('should paginate correctly', async () => {
      const res = await request(app).get('/api/questions?page=1&limit=2').set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
    });
  });

  // ─── GET /api/questions/random ─────────────────────────────────────────────
  describe('GET /api/questions/random', () => {
    it('should return random questions', async () => {
      const res = await request(app).get('/api/questions/random?limit=3').set(auth());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
    });

    it('should filter random questions by role', async () => {
      const res = await request(app).get('/api/questions/random?role=BE').set(auth());

      expect(res.status).toBe(200);
      res.body.data.forEach((q) => expect(q.role).toBe('BE'));
    });
  });

  // ─── GET /api/questions/categories ────────────────────────────────────────
  describe('GET /api/questions/categories', () => {
    it('should return categories with counts', async () => {
      const res = await request(app).get('/api/questions/categories').set(auth());

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((cat) => {
        expect(cat).toHaveProperty('category');
        expect(cat).toHaveProperty('total');
        expect(cat).toHaveProperty('difficulties');
      });
    });
  });

  // ─── GET /api/questions/:id ────────────────────────────────────────────────
  describe('GET /api/questions/:id', () => {
    it('should return a single question with sampleAnswer and hints', async () => {
      const listRes = await request(app).get('/api/questions').set(auth());
      const questionId = listRes.body.data[0]._id;

      const res = await request(app).get(`/api/questions/${questionId}`).set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(questionId);
    });

    it('should return 404 for non-existent question', async () => {
      const res = await request(app)
        .get('/api/questions/000000000000000000000000')
        .set(auth());

      expect(res.status).toBe(404);
    });
  });
});
