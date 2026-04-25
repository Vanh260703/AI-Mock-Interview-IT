/**
 * Set titles for all coding questions using unique content snippets
 * Run: node src/seeders/set-all-titles.seeder.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/question.model');

// Each entry: { snippet, title } — snippet is a unique substring of content
const TITLE_BY_SNIPPET = [
  // ─── Array / Hash Map ──────────────────────────────────────────────────────
  { snippet: 'nums[i] + nums[j] === target',          title: 'Two Sum' },
  { snippet: 'tổng lớn nhất** của một mảng con liên tiếp', title: 'Maximum Subarray' },
  { snippet: 'tích của tất cả phần tử',               title: 'Product of Array Except Self' },
  { snippet: 'chuỗi số liên tiếp dài nhất',           title: 'Longest Consecutive Sequence' },
  { snippet: 'merge** các khoảng chồng lấp',          title: 'Merge Intervals' },
  { snippet: 'Gom nhóm các **anagram**',              title: 'Group Anagrams' },
  { snippet: 'nhiều hơn n/2 lần',                     title: 'Majority Element' },
  { snippet: 'hai cột** tạo ra bể chứa',              title: 'Container With Most Water' },
  { snippet: 'Xoay mảng sang **phải**',               title: 'Rotate Array' },
  { snippet: 'ký tự **đầu tiên không lặp lại**',      title: 'First Unique Character in a String' },

  // ─── String ─────────────────────────────────────────────────────────────────
  { snippet: 'bỏ qua ký tự không phải chữ/số',        title: 'Valid Palindrome' },
  { snippet: 'chuỗi con không có ký tự lặp lại** dài nhất', title: 'Longest Substring Without Repeating Characters' },
  { snippet: 'tất cả **hoán vị** của chuỗi',          title: 'String Permutations' },
  { snippet: "các ký tự `'('`, `')'`",                title: 'Valid Parentheses' },
  { snippet: 'phân tách thành các từ** trong',         title: 'Word Break' },

  // ─── Linked List ─────────────────────────────────────────────────────────────
  { snippet: 'Đảo ngược một **Linked List**',          title: 'Reverse Linked List' },
  { snippet: 'Phát hiện **cycle** trong Linked List',  title: 'Linked List Cycle' },
  { snippet: 'node giữa** của Linked List',            title: 'Middle of the Linked List' },
  { snippet: 'Merge hai **sorted linked list**',       title: 'Merge Two Sorted Lists' },

  // ─── Tree ────────────────────────────────────────────────────────────────────
  { snippet: 'chiều cao (max depth)** của Binary Tree', title: 'Maximum Depth of Binary Tree' },
  { snippet: 'Level-order traversal** của Binary Tree', title: 'Binary Tree Level Order Traversal' },
  { snippet: 'Validate **Binary Search Tree**',        title: 'Validate Binary Search Tree' },
  { snippet: 'Lowest Common Ancestor (LCA)**',         title: 'Lowest Common Ancestor of a BST' },
  { snippet: 'cây đối xứng** (symmetric',              title: 'Symmetric Tree' },

  // ─── Sorting & Searching ─────────────────────────────────────────────────────
  { snippet: 'Implement **Binary Search**',            title: 'Binary Search' },
  { snippet: 'Implement **Merge Sort**',               title: 'Merge Sort' },
  { snippet: '**K phần tử lớn nhất**',                title: 'Kth Largest Element in an Array' },
  { snippet: 'phần tử bị thiếu** trong mảng',         title: 'Missing Number' },

  // ─── Dynamic Programming ─────────────────────────────────────────────────────
  { snippet: '**Climbing Stairs:**',                   title: 'Climbing Stairs' },
  { snippet: '**Coin Change:**',                       title: 'Coin Change' },
  { snippet: '**Longest Increasing Subsequence (LIS):**', title: 'Longest Increasing Subsequence' },
  { snippet: '**0/1 Knapsack:**',                      title: '0/1 Knapsack' },
  { snippet: '**Longest Common Subsequence (LCS):**',  title: 'Longest Common Subsequence' },

  // ─── Data Structures ─────────────────────────────────────────────────────────
  { snippet: 'Implement **MinStack**',                 title: 'Min Stack' },
  { snippet: 'Implement **LRU Cache**',                title: 'LRU Cache' },
  { snippet: 'Implement **Queue dùng 2 Stack**',       title: 'Implement Queue Using Two Stacks' },
  { snippet: 'Implement **Trie (Prefix Tree)**',       title: 'Implement Trie (Prefix Tree)' },
  { snippet: 'Implement **Graph BFS**',               title: 'Shortest Path in Graph (BFS)' },

  // ─── JavaScript Core ─────────────────────────────────────────────────────────
  { snippet: 'Implement hàm **`debounce',              title: 'Debounce' },
  { snippet: 'Implement hàm **`throttle',              title: 'Throttle' },
  { snippet: 'Implement hàm **`curry',                 title: 'Curry Function' },
  { snippet: 'Implement **`Promise.all`**',            title: 'Implement Promise.all' },
  { snippet: 'Implement hàm **`memoize',              title: 'Memoize' },
  { snippet: '**`deepClone(obj)`**',                  title: 'Deep Clone' },
  { snippet: 'Implement **`EventEmitter`**',           title: 'Event Emitter' },
  { snippet: 'Flatten mảng lồng nhau',                title: 'Flatten Nested Array' },

  // ─── React Hooks ─────────────────────────────────────────────────────────────
  { snippet: 'useLocalStorage(key, initialValue)',     title: 'useLocalStorage Hook' },
  { snippet: 'useFetch(url)',                          title: 'useFetch Hook' },
  { snippet: 'useDebounce(value, delay)',              title: 'useDebounce Hook' },
  { snippet: 'useIntersectionObserver',               title: 'useIntersectionObserver Hook' },

  // ─── Node.js ─────────────────────────────────────────────────────────────────
  { snippet: 'rate limit',                            title: 'Rate Limiter Middleware' },
  { snippet: 'pipeline Express',                      title: 'Express Middleware Pipeline' },
  { snippet: 'worker_threads',                        title: 'Node.js Clustering & Workers' },
  { snippet: 'Readable stream',                       title: 'Node.js Streams' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const questions = await Question.find({ type: 'coding' }).lean();
  console.log(`Found ${questions.length} coding questions`);

  let updated = 0;
  let noMatch = 0;

  for (const q of questions) {
    const entry = TITLE_BY_SNIPPET.find(({ snippet }) =>
      q.content?.includes(snippet)
    );

    if (entry) {
      await Question.findByIdAndUpdate(q._id, { $set: { title: entry.title } });
      console.log(`  ✓ ${entry.title}`);
      updated++;
    } else {
      console.log(`  ⚠ no match: [${q.topic}] ${q.difficulty}/${q.level}`);
      noMatch++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${noMatch} skipped`);

  // Verify
  const withTitle = await Question.countDocuments({ type: 'coding', title: { $exists: true, $ne: null } });
  console.log(`Questions with title: ${withTitle}/${questions.length}`);

  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
