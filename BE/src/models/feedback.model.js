const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Nếu type = 'answer': feedback cho 1 câu trả lời cụ thể
    // Nếu type = 'session': feedback tổng kết toàn session (answer = null)
    type: {
      type: String,
      enum: ['answer', 'session'],
      required: true,
    },

    answer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },

    // Điểm tổng (0-100)
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // Điểm chi tiết theo từng tiêu chí (0-10)
    metrics: {
      clarity:           { type: Number, min: 0, max: 10, default: null }, // Độ rõ ràng
      relevance:         { type: Number, min: 0, max: 10, default: null }, // Độ liên quan
      technicalAccuracy: { type: Number, min: 0, max: 10, default: null }, // Độ chính xác kỹ thuật
      communication:     { type: Number, min: 0, max: 10, default: null }, // Kỹ năng giao tiếp
      confidence:        { type: Number, min: 0, max: 10, default: null }, // Sự tự tin
    },

    // Điểm mạnh AI nhận xét
    strengths: [{ type: String }],

    // Điểm cần cải thiện
    improvements: [{ type: String }],

    // Nhận xét tổng hợp từ AI
    summary: {
      type: String,
      trim: true,
    },

    // Các từ khoá AI phát hiện trong câu trả lời
    keywords: [{ type: String }],

    // Ai tạo feedback
    generatedBy: {
      type: String,
      enum: ['ai', 'human'],
      default: 'ai',
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ session: 1, type: 1 });
feedbackSchema.index({ answer: 1 }, { sparse: true });
feedbackSchema.index({ user: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
