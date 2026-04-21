/**
 * E2E: Toàn bộ interview flow
 *
 * Flow:
 * 1. Tạo session (POST /api/interviews)
 * 2. Submit answer (POST /api/interviews/:id/answers) → enqueue FeedbackJob
 * 3. Complete session (PUT /api/interviews/:id/complete)
 * 4. Simulate worker: gọi processFeedbackJob + processSessionFeedbackJob trực tiếp
 * 5. GET /api/feedback/session/:id → verify graded=1, isComplete=true, overallScore updated
 */

jest.mock('../../src/services/ai.service', () => ({
  gradeAnswer: jest.fn().mockResolvedValue({
    overallScore: 82,
    metrics: {
      clarity: 8, relevance: 9, technicalAccuracy: 8, communication: 8, confidence: 7,
    },
    strengths:    ['Câu trả lời rõ ràng', 'Có ví dụ thực tế'],
    improvements: ['Nên đi sâu hơn về kỹ thuật'],
    summary:      'Câu trả lời khá tốt, phù hợp với level intern.',
    keywords:     ['teamwork', 'project', 'learning'],
  }),
  generateSessionFeedback: jest.fn().mockResolvedValue({
    overallScore: 80,
    metrics: {
      clarity: 8, relevance: 8, technicalAccuracy: 8, communication: 8, confidence: 8,
    },
    strengths:    ['Thể hiện tốt mindset học hỏi'],
    improvements: ['Cần thêm ví dụ cụ thể'],
    summary:      'Session tổng thể ổn, phù hợp với intern.',
  }),
}));

const request  = require('supertest');
const app      = require('../../src/app');
const Feedback = require('../../src/models/feedback.model');
const InterviewSession = require('../../src/models/interview-session.model');
const { processFeedbackJob, processSessionFeedbackJob } =
  require('../../src/workers/feedback.worker');
const { createAuthUser }  = require('../helpers/auth.helper');
const { seedQuestions }   = require('../helpers/question.helper');
const { __mockQueue }     = require('../mocks/bull');

let token, user;

beforeEach(async () => {
  ({ token, user } = await createAuthUser());
  await seedQuestions();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('E2E: Full Interview Flow', () => {
  it('should complete full flow: create → answer → complete → AI grade → feedback available', async () => {
    // ── Step 1: Tạo session ────────────────────────────────────────────────
    const sessionRes = await request(app)
      .post('/api/interviews')
      .set(auth())
      .send({ level: 'intern', role: 'General', questionCount: 1 });

    expect(sessionRes.status).toBe(201);
    const sessionId  = sessionRes.body.data._id;
    const questionId = sessionRes.body.data.questions[0]._id;

    // ── Step 2: Submit answer ──────────────────────────────────────────────
    const answerRes = await request(app)
      .post(`/api/interviews/${sessionId}/answers`)
      .set(auth())
      .send({
        questionId,
        content:  'Tôi đã từng làm project quản lý sinh viên, sử dụng React và Node.js.',
        duration: 90,
        status:   'submitted',
      });

    expect(answerRes.status).toBe(200);
    const answerId = answerRes.body.data.answer._id;

    // Verify FeedbackJob được enqueue
    expect(__mockQueue.add).toHaveBeenCalledWith(
      'FeedbackJob',
      expect.objectContaining({ answerId: expect.anything(), sessionId: expect.anything() }),
      expect.any(Object)
    );

    // ── Step 3: Complete session ───────────────────────────────────────────
    const completeRes = await request(app)
      .put(`/api/interviews/${sessionId}/complete`)
      .set(auth());

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.session.status).toBe('completed');

    // ── Step 4: Simulate FeedbackJob worker ───────────────────────────────
    await processFeedbackJob({ data: { answerId, sessionId } });

    // Verify Feedback answer được tạo
    const answerFeedback = await Feedback.findOne({ session: sessionId, type: 'answer' });
    expect(answerFeedback).not.toBeNull();
    expect(answerFeedback.overallScore).toBe(82);
    expect(answerFeedback.strengths.length).toBeGreaterThan(0);

    // Verify SessionFeedbackJob được enqueue (vì session đã completed + tất cả graded)
    expect(__mockQueue.add).toHaveBeenCalledWith(
      'SessionFeedbackJob',
      expect.objectContaining({ sessionId: expect.anything() }),
      expect.any(Object)
    );

    // ── Step 5: Simulate SessionFeedbackJob worker ────────────────────────
    await processSessionFeedbackJob({ data: { sessionId } });

    // Verify session feedback được tạo và overallScore cập nhật
    const sessionFeedback = await Feedback.findOne({ session: sessionId, type: 'session' });
    expect(sessionFeedback).not.toBeNull();
    expect(sessionFeedback.overallScore).toBe(80);

    const updatedSession = await InterviewSession.findById(sessionId);
    expect(updatedSession.overallScore).toBe(80);

    // ── Step 6: GET feedback endpoint ─────────────────────────────────────
    const feedbackRes = await request(app)
      .get(`/api/feedback/session/${sessionId}`)
      .set(auth());

    expect(feedbackRes.status).toBe(200);
    expect(feedbackRes.body.data.progress).toMatchObject({
      total:      1,
      graded:     1,
      isComplete: true,
    });
    expect(feedbackRes.body.data.answerFeedbacks).toHaveLength(1);
    expect(feedbackRes.body.data.sessionFeedback).not.toBeNull();
    expect(feedbackRes.body.data.session.overallScore).toBe(80);
  });

  it('should handle SessionFeedbackJob idempotency (skip if already done)', async () => {
    const sessionRes = await request(app)
      .post('/api/interviews')
      .set(auth())
      .send({ level: 'intern', role: 'General', questionCount: 1 });

    const sessionId = sessionRes.body.data._id;

    // Tạo session feedback trước
    await Feedback.create({
      session: sessionId, user: user._id, answer: null, type: 'session',
      overallScore: 90,
      metrics: { clarity: 9, relevance: 9, technicalAccuracy: 9, communication: 9, confidence: 9 },
      strengths: ['Tuyệt vời'], improvements: [], summary: 'Rất tốt', generatedBy: 'ai',
    });

    // Gọi lại SessionFeedbackJob — phải skip, không tạo duplicate
    const result = await processSessionFeedbackJob({ data: { sessionId } });
    expect(result.skipped).toBe(true);

    const count = await Feedback.countDocuments({ session: sessionId, type: 'session' });
    expect(count).toBe(1); // Không tạo thêm
  });

  it('should NOT trigger SessionFeedbackJob when session is still in_progress', async () => {
    const sessionRes = await request(app)
      .post('/api/interviews')
      .set(auth())
      .send({ level: 'intern', role: 'General', questionCount: 1 });

    const sessionId  = sessionRes.body.data._id;
    const questionId = sessionRes.body.data.questions[0]._id;

    const answerRes = await request(app)
      .post(`/api/interviews/${sessionId}/answers`)
      .set(auth())
      .send({ questionId, content: 'Test answer', duration: 60, status: 'submitted' });

    const answerId = answerRes.body.data.answer._id;

    // Session chưa completed — FeedbackJob chạy nhưng không enqueue SessionFeedbackJob
    await processFeedbackJob({ data: { answerId, sessionId } });

    const sessionFeedbackJobCalls = __mockQueue.add.mock.calls.filter(
      ([name]) => name === 'SessionFeedbackJob'
    );
    expect(sessionFeedbackJobCalls.length).toBe(0);
  });
});
