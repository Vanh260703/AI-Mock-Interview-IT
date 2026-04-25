/**
 * Fix wrongly-assigned titles from previous migration
 * Run: node src/seeders/fix-question-titles.seeder.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/question.model');

// Each entry: { contentKeyword, title } - match by EXACT content snippet
const FIXES = [
  // Linked List — bị match sai vì "list" có "lis"
  { content: 'Đảo ngược một **Linked List**',         title: 'Reverse Linked List' },
  { content: 'Phát hiện **cycle** trong Linked List',  title: 'Linked List Cycle' },
  { content: 'Merge hai **sorted linked list**',       title: 'Merge Two Sorted Lists' },
  // JS — bị match sai vì "milliseconds" có "lis"
  { content: 'debounce(fn, delay)',                    title: 'Debounce' },
  { content: 'throttle(fn, limit)',                    title: 'Throttle' },
  // EventEmitter — "listener" có "lis"
  { content: 'EventEmitter',                           title: 'Event Emitter' },
  // useFetch nếu bị sai
  { content: 'useFetch(url)',                          title: 'useFetch Hook' },
  // useDebounce nếu bị sai
  { content: 'useDebounce(value, delay)',               title: 'useDebounce Hook' },
  // useIntersectionObserver nếu chưa có title
  { content: 'useIntersectionObserver',                title: 'useIntersectionObserver Hook' },
  // Node.js questions — match by unique snippet
  { content: 'rate limiter',                           title: 'Rate Limiter Middleware' },
  { content: 'express middleware',                     title: 'Express Middleware Pipeline' },
  { content: 'worker_threads',                         title: 'Node.js Clustering & Workers' },
  { content: 'readable stream',                        title: 'Node.js Streams' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let fixed = 0;

  const allQuestions = await Question.find({ type: 'coding' });

  for (const { content: keyword, title } of FIXES) {
    // Use simple includes() to avoid regex special char issues
    const matches = allQuestions.filter((q) =>
      q.content?.toLowerCase().includes(keyword.toLowerCase())
    );

    for (const q of matches) {
      if (q.title !== title) {
        await Question.findByIdAndUpdate(q._id, { title });
        console.log(`  ✓ Fixed: "${q.title ?? '(none)'}" → "${title}"  [topic: ${q.topic}]`);
        fixed++;
      }
    }
  }

  // Verify: show all coding questions with their titles
  console.log('\n─── Final state ───────────────────────────────────────────────');
  const all = await Question.find({ type: 'coding' }).sort({ createdAt: 1 });
  for (const q of all) {
    const marker = q.title ? '✓' : '⚠';
    console.log(`  ${marker} ${q.title ?? '(no title)'}  [${q.topic}]`);
  }

  console.log(`\nFixed ${fixed} questions`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
