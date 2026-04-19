const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },

    // Loại câu hỏi
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'situational', 'hr'],
      required: true,
    },

    // Độ khó
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    // Chủ đề kỹ thuật (e.g. "JavaScript", "React", "System Design", "OOP")
    topic: {
      type: String,
      trim: true,
    },

    // Tags bổ sung để filter
    tags: [{ type: String, trim: true }],

    // Thời gian dự kiến trả lời (giây), mặc định 2 phút
    expectedDuration: {
      type: Number,
      default: 120,
    },

    // Câu trả lời mẫu (dùng để AI so sánh hoặc gợi ý)
    sampleAnswer: {
      type: String,
      trim: true,
    },

    // Gợi ý cho người dùng
    hints: [{ type: String }],

    isActive: {
      type: Boolean,
      default: true,
    },

    // Admin tạo câu hỏi
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

questionSchema.index({ category: 1, difficulty: 1, topic: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);
