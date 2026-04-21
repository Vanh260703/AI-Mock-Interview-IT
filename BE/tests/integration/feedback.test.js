const request = require('supertest');
const app     = require('../../src/app');
const { createAuthUser }  = require('../helpers/auth.helper');
const { seedQuestions }   = require('../helpers/question.helper');
const Feedback = require('../../src/models/feedback.model');
const Answer   = require('../../src/models/answer.model');
const InterviewSession = require('../../src/models/interview-session.model');

let token;

beforeEach(async () => {
  ({ token } = await createAuthUser());
  await seedQuestions();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

const createAndCompleteSession = async () => {
  // Tạo session
  const sessionRes = await request(app)
    .post('/api/interviews')
    .set(auth())
    .send({ level: 'intern', role: 'General', questionCount: 1 });

  const sessionId  = sessionRes.body.data._id;
  const questionId = sessionRes.body.data.questions[0]._id;

  // Submit answer
  await request(app)
    .post(`/api/interviews/${sessionId}/answers`)
    .set(auth())
    .send({ questionId, content: 'Câu trả lời test', duration: 60, status: 'submitted' });

  // Complete session
  await request(app).put(`/api/interviews/${sessionId}/complete`).set(auth());

  return { sessionId, questionId };
};

describe('Feedback Endpoints', () => {
  // ─── GET /api/feedback/session/:sessionId ──────────────────────────────────
  describe('GET /api/feedback/session/:sessionId', () => {
    it('should return progress info for a session with no feedback yet', async () => {
      const { sessionId } = await createAndCompleteSession();

      const res = await request(app)
        .get(`/api/feedback/session/${sessionId}`)
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.progress).toMatchObject({
        total:      1,
        graded:     0,
        isComplete: false,
      });
      expect(res.body.data.answerFeedbacks).toHaveLength(0);
      expect(res.body.data.sessionFeedback).toBeNull();
    });

    it('should return graded=1 after feedback is saved', async () => {
      const { sessionId, questionId } = await createAndCompleteSession();
      const answer = await Answer.findOne({ session: sessionId });

      // Simulate: AI đã chấm xong, feedback đã được lưu
      await Feedback.create({
        session:      sessionId,
        user:         answer.user,
        answer:       answer._id,
        type:         'answer',
        overallScore: 75,
        metrics:      { clarity: 7, relevance: 8, technicalAccuracy: 7, communication: 8, confidence: 7 },
        strengths:    ['Trả lời rõ ràng'],
        improvements: ['Cần nêu ví dụ cụ thể hơn'],
        summary:      'Câu trả lời ổn',
        generatedBy:  'ai',
      });

      const res = await request(app)
        .get(`/api/feedback/session/${sessionId}`)
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.progress.graded).toBe(1);
      expect(res.body.data.answerFeedbacks).toHaveLength(1);
      expect(res.body.data.answerFeedbacks[0].overallScore).toBe(75);
    });

    it('should return isComplete=true when session feedback exists', async () => {
      const { sessionId } = await createAndCompleteSession();
      const answer = await Answer.findOne({ session: sessionId });

      await Feedback.insertMany([
        {
          session: sessionId, user: answer.user, answer: answer._id,
          type: 'answer', overallScore: 80,
          metrics: { clarity: 8, relevance: 8, technicalAccuracy: 8, communication: 8, confidence: 8 },
          strengths: ['Tốt'], improvements: [], summary: 'OK', generatedBy: 'ai',
        },
        {
          session: sessionId, user: answer.user, answer: null,
          type: 'session', overallScore: 80,
          metrics: { clarity: 8, relevance: 8, technicalAccuracy: 8, communication: 8, confidence: 8 },
          strengths: ['Tốt'], improvements: [], summary: 'Session OK', generatedBy: 'ai',
        },
      ]);
      // Simulate worker updating session overallScore
      await InterviewSession.findByIdAndUpdate(sessionId, { overallScore: 80 });

      const res = await request(app)
        .get(`/api/feedback/session/${sessionId}`)
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body.data.progress.isComplete).toBe(true);
      expect(res.body.data.sessionFeedback).not.toBeNull();
      expect(res.body.data.session.overallScore).toBe(80);
    });

    it('should return 404 for another user session', async () => {
      const { sessionId } = await createAndCompleteSession();
      const { token: otherToken } = await createAuthUser();

      const res = await request(app)
        .get(`/api/feedback/session/${sessionId}`)
        .set({ Authorization: `Bearer ${otherToken}` });

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /api/feedback/session/:sessionId (manual trigger) ───────────────
  describe('POST /api/feedback/session/:sessionId', () => {
    it('should return 202 and enqueue jobs for submitted answers', async () => {
      const { sessionId } = await createAndCompleteSession();

      const res = await request(app)
        .post(`/api/feedback/session/${sessionId}`)
        .set(auth());

      expect(res.status).toBe(202);
      expect(res.body.jobCount).toBe(1);
    });

    it('should return 400 when session is not completed', async () => {
      const sessionRes = await request(app)
        .post('/api/interviews')
        .set(auth())
        .send({ level: 'intern', role: 'General', questionCount: 1 });

      const res = await request(app)
        .post(`/api/feedback/session/${sessionRes.body.data._id}`)
        .set(auth());

      expect(res.status).toBe(400);
    });

    it('should return 409 when feedback already generated', async () => {
      const { sessionId } = await createAndCompleteSession();
      const answer = await Answer.findOne({ session: sessionId });

      await Feedback.create({
        session: sessionId, user: answer.user, answer: null,
        type: 'session', overallScore: 70,
        metrics: { clarity: 7, relevance: 7, technicalAccuracy: 7, communication: 7, confidence: 7 },
        strengths: [], improvements: [], summary: 'done', generatedBy: 'ai',
      });

      const res = await request(app)
        .post(`/api/feedback/session/${sessionId}`)
        .set(auth());

      expect(res.status).toBe(409);
    });
  });
});
