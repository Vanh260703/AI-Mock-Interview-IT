const Question = require('../../src/models/question.model');

const sampleQuestions = [
  {
    content:  'Hãy kể về dự án bạn tâm đắc nhất?',
    category: 'behavioral',
    difficulty: 'easy',
    topic:    'Project Experience',
    role:     'General',
    level:    'intern',
    tags:     ['project', 'intern'],
    expectedDuration: 90,
  },
  {
    content:  'Virtual DOM là gì?',
    category: 'technical',
    difficulty: 'medium',
    topic:    'React',
    role:     'FE',
    level:    'junior',
    tags:     ['react', 'frontend'],
    expectedDuration: 120,
  },
  {
    content:  'REST API là gì?',
    category: 'technical',
    difficulty: 'easy',
    topic:    'API Design',
    role:     'BE',
    level:    'fresher',
    tags:     ['rest', 'backend'],
    expectedDuration: 90,
  },
  {
    content:  'Tại sao bạn muốn làm việc ở đây?',
    category: 'hr',
    difficulty: 'easy',
    topic:    'Company Research',
    role:     'General',
    level:    'intern',
    tags:     ['hr', 'motivation'],
    expectedDuration: 90,
  },
  {
    content:  'Thiết kế hệ thống URL shortener',
    category: 'situational',
    difficulty: 'hard',
    topic:    'System Design',
    role:     'FS',
    level:    'senior',
    tags:     ['system design'],
    expectedDuration: 1800,
  },
];

const seedQuestions = async (overrides = []) => {
  const data = overrides.length > 0 ? overrides : sampleQuestions;
  return Question.insertMany(data);
};

module.exports = { seedQuestions, sampleQuestions };
