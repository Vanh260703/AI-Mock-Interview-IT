const groq = require('../config/groq');

const GROQ_MODEL = 'llama-3.3-70b-versatile';

// POST /api/ai/test
// Body: { message }
// Dùng để test Groq AI hoạt động đúng không
exports.testAI = async (req, res, next) => {
  try {
    const { message = 'Say hello and introduce yourself briefly.' } = req.body;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for an AI Mock Interview platform. Be concise and helpful.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content ?? '';

    res.json({
      model: completion.model,
      reply,
      usage: completion.usage,
    });
  } catch (err) {
    next(err);
  }
};
