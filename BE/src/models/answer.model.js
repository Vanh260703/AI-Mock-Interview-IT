const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
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

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },

    // Nội dung câu trả lời (text hoặc transcript từ voice)
    content: {
      type: String,
      trim: true,
      default: '',
    },

    // URL file ghi âm (nếu trả lời bằng giọng nói)
    audioUrl: {
      type: String,
      default: null,
    },

    // URL file quay video (nếu trả lời bằng video)
    videoUrl: {
      type: String,
      default: null,
    },

    // Thời gian user dùng để trả lời câu này (giây)
    duration: {
      type: Number,
      default: 0,
    },

    // Trạng thái câu trả lời
    status: {
      type: String,
      enum: ['drafted', 'submitted', 'skipped'],
      default: 'drafted',
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Mỗi user chỉ có 1 câu trả lời cho 1 câu hỏi trong 1 session
answerSchema.index({ session: 1, question: 1, user: 1 }, { unique: true });
answerSchema.index({ session: 1 });
answerSchema.index({ user: 1 });

module.exports = mongoose.model('Answer', answerSchema);
