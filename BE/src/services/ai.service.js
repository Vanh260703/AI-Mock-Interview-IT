const groq = require('../config/groq');
const { toFile } = require('groq-sdk');

const GROQ_MODEL   = 'llama-3.3-70b-versatile';
const WHISPER_MODEL = 'whisper-large-v3';

// Parse JSON từ AI response (handle trường hợp AI wrap trong markdown code block)
const parseAIJson = (raw) => {
  const cleaned = raw.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

// Chấm điểm 1 câu trả lời
const gradeAnswer = async (question, answerContent) => {
  const prompt = `Question: ${question.content}
Category: ${question.category}
Difficulty: ${question.difficulty}
Topic: ${question.topic || 'General'}
${question.sampleAnswer ? `Reference Answer: ${question.sampleAnswer}` : ''}

Candidate's Answer: ${answerContent?.trim() || '(No answer — candidate skipped this question)'}`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert technical interviewer for software engineering positions.
Grade the candidate's answer objectively and professionally.
Return ONLY valid JSON, no markdown, no explanation outside JSON:
{
  "overallScore": <integer 0-100>,
  "metrics": {
    "clarity":           <integer 0-10>,
    "relevance":         <integer 0-10>,
    "technicalAccuracy": <integer 0-10>,
    "communication":     <integer 0-10>,
    "confidence":        <integer 0-10>
  },
  "strengths":    ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "summary":      "2-3 sentence objective assessment",
  "keywords":     ["keyword1", "keyword2"]
}`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return parseAIJson(completion.choices[0]?.message?.content ?? '{}');
};

// Tổng kết toàn bộ session sau khi hoàn thành
const generateSessionFeedback = async (sessionType, qaPairs) => {
  const pairsText = qaPairs
    .map(
      (qa, i) =>
        `Q${i + 1} [${qa.category} / ${qa.difficulty}]: ${qa.question}\n` +
        `Answer: ${qa.answer || '(skipped)'}\n` +
        `Score: ${qa.score !== null ? qa.score + '/100' : 'N/A'}`
    )
    .join('\n\n');

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert technical interviewer. Generate a comprehensive overall assessment for a completed mock interview session.
Return ONLY valid JSON, no markdown:
{
  "overallScore": <integer 0-100>,
  "metrics": {
    "clarity":           <integer 0-10>,
    "relevance":         <integer 0-10>,
    "technicalAccuracy": <integer 0-10>,
    "communication":     <integer 0-10>,
    "confidence":        <integer 0-10>
  },
  "strengths":    ["strength1", "strength2", "strength3"],
  "improvements": ["area1", "area2", "area3"],
  "summary":      "3-4 sentence comprehensive assessment of overall performance"
}`,
      },
      {
        role: 'user',
        content: `Interview Type: ${sessionType}\n\nQ&A Summary:\n${pairsText}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return parseAIJson(completion.choices[0]?.message?.content ?? '{}');
};

// Transcribe audio/video buffer thành text bằng GROQ Whisper
const transcribeAudio = async (buffer, mimetype, originalname = 'audio.webm') => {
  const file = await toFile(buffer, originalname, { type: mimetype });

  const transcription = await groq.audio.transcriptions.create({
    file,
    model:           WHISPER_MODEL,
    response_format: 'text',
  });

  // GROQ trả về string khi response_format='text'
  return typeof transcription === 'string' ? transcription.trim() : transcription.text?.trim() ?? '';
};

module.exports = { gradeAnswer, generateSessionFeedback, transcribeAudio };
