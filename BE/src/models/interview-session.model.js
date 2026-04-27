const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      trim: true,
      default: 'Mock Interview Session',
    },

    // Loại phỏng vấn
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'mixed'],
      default: 'mixed',
    },

    // Trạng thái session
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'abandoned'],
      default: 'pending',
    },

    // Danh sách câu hỏi được chọn cho session này
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],

    // Cài đặt khi tạo session
    settings: {
      questionCount:   { type: Number, default: 5 },
      difficulty:      { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
      topics:          [{ type: String }],
      timePerQuestion: { type: Number, default: 300 }, // giây
      role:            { type: String, enum: ['FE', 'BE', 'FS', 'BA', 'DA', 'DS', 'DevOps', 'Mobile', 'General'], default: null },
      level:           { type: String, enum: ['intern', 'fresher', 'junior', 'middle', 'senior'], default: null },
    },

    // Thời gian
    startedAt:   { type: Date },
    completedAt: { type: Date },

    // Tổng thời gian làm bài (giây)
    duration: {
      type: Number,
      default: 0,
    },

    // Điểm tổng (0-100), được cập nhật sau khi AI chấm xong
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ user: 1, status: 1 });
interviewSessionSchema.index({ user: 1, status: 1, completedAt: -1 });
interviewSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
