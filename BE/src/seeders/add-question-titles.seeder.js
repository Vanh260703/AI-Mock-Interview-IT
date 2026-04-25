/**
 * Migration: Add title field to existing coding questions
 * Run: node src/seeders/add-question-titles.seeder.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/question.model');

// Map: { topic, difficulty, level } → title
// Mỗi combination là duy nhất trong DB
const TITLE_MAP = [
  // ─── Array / Hash Map ──────────────────────────────────────────────────────
  { topic: 'Array / Hash Map',          difficulty: 'easy',   level: 'intern',  title: 'Two Sum' },
  { topic: 'Dynamic Programming / Array',difficulty: 'medium', level: 'junior',  title: 'Maximum Subarray' },
  { topic: 'Array / Prefix Product',    difficulty: 'medium', level: 'middle',  title: 'Product of Array Except Self' },
  { topic: 'Hash Set / Array',          difficulty: 'medium', level: 'middle',  title: 'Longest Consecutive Sequence' },
  { topic: 'Array / Sorting',           difficulty: 'medium', level: 'junior',  title: 'Merge Intervals' },
  { topic: 'Hash Map / String',         difficulty: 'medium', level: 'junior',  title: 'Group Anagrams' },
  { topic: 'Array / Voting Algorithm',  difficulty: 'medium', level: 'junior',  title: 'Majority Element' },
  { topic: 'Two Pointers',              difficulty: 'medium', level: 'junior',  title: 'Container With Most Water' },
  { topic: 'Array / In-place',          difficulty: 'medium', level: 'junior',  title: 'Rotate Array' },
  { topic: 'String / Hash Map',         difficulty: 'easy',   level: 'intern',  title: 'First Unique Character in a String' },

  // ─── String ─────────────────────────────────────────────────────────────────
  { topic: 'String / Two Pointers',     difficulty: 'easy',   level: 'intern',  title: 'Valid Palindrome' },
  { topic: 'Sliding Window / String',   difficulty: 'medium', level: 'junior',  title: 'Longest Substring Without Repeating Characters' },
  { topic: 'Backtracking / String',     difficulty: 'hard',   level: 'middle',  title: 'String Permutations' },
  { topic: 'Stack / String',            difficulty: 'easy',   level: 'intern',  title: 'Valid Parentheses' },
  { topic: 'Dynamic Programming / String', difficulty: 'hard', level: 'senior', title: 'Word Break' },

  // ─── Linked List ─────────────────────────────────────────────────────────────
  { topic: 'Linked List',               difficulty: 'easy',   level: 'fresher', title: 'Reverse Linked List' },
  { topic: 'Linked List / Two Pointers',difficulty: 'easy',   level: 'fresher', title: 'Linked List Cycle' },
  { topic: 'Linked List / Two Pointers',difficulty: 'easy',   level: 'intern',  title: 'Middle of the Linked List' },
  { topic: 'Linked List',               difficulty: 'easy',   level: 'intern',  title: 'Merge Two Sorted Lists' },

  // ─── Tree ────────────────────────────────────────────────────────────────────
  { topic: 'Tree / DFS',                difficulty: 'easy',   level: 'junior',  title: 'Maximum Depth of Binary Tree' },
  { topic: 'Tree / BFS',                difficulty: 'medium', level: 'junior',  title: 'Binary Tree Level Order Traversal' },
  { topic: 'Tree / BST',                difficulty: 'medium', level: 'middle',  title: 'Validate Binary Search Tree' },
  { topic: 'Tree / BST',                difficulty: 'medium', level: 'middle',  title: 'Lowest Common Ancestor of a BST' },
  { topic: 'Tree / DFS',                difficulty: 'easy',   level: 'junior',  title: 'Symmetric Tree' },

  // ─── Sorting & Searching ─────────────────────────────────────────────────────
  { topic: 'Binary Search',             difficulty: 'easy',   level: 'intern',  title: 'Binary Search' },
  { topic: 'Sorting',                   difficulty: 'medium', level: 'junior',  title: 'Merge Sort' },
  { topic: 'Sorting / QuickSelect',     difficulty: 'medium', level: 'middle',  title: 'Kth Largest Element in an Array' },
  { topic: 'Math / Array',              difficulty: 'easy',   level: 'intern',  title: 'Missing Number' },

  // ─── Dynamic Programming ─────────────────────────────────────────────────────
  { topic: 'Dynamic Programming',       difficulty: 'easy',   level: 'intern',  title: 'Climbing Stairs' },
  { topic: 'Dynamic Programming',       difficulty: 'medium', level: 'middle',  title: 'Coin Change' },
  { topic: 'Dynamic Programming',       difficulty: 'medium', level: 'middle',  title: 'Longest Increasing Subsequence' },
  { topic: 'Dynamic Programming',       difficulty: 'hard',   level: 'senior',  title: '0/1 Knapsack' },
  { topic: 'Dynamic Programming',       difficulty: 'hard',   level: 'middle',  title: 'Longest Common Subsequence' },

  // ─── Data Structures ─────────────────────────────────────────────────────────
  { topic: 'Stack / Design',            difficulty: 'medium', level: 'junior',  title: 'Min Stack' },
  { topic: 'Design / Hash Map',         difficulty: 'hard',   level: 'senior',  title: 'LRU Cache' },
  { topic: 'Stack / Queue / Design',    difficulty: 'easy',   level: 'fresher', title: 'Implement Queue Using Two Stacks' },
  { topic: 'Trie / Design',             difficulty: 'medium', level: 'middle',  title: 'Implement Trie (Prefix Tree)' },
  { topic: 'Graph / BFS',               difficulty: 'medium', level: 'middle',  title: 'Shortest Path in Graph (BFS)' },

  // ─── JavaScript Core ─────────────────────────────────────────────────────────
  { topic: 'JavaScript / Closure',      difficulty: 'medium', level: 'junior',  title: 'Debounce' },
  { topic: 'JavaScript / Closure',      difficulty: 'medium', level: 'junior',  title: 'Throttle' },
  { topic: 'JavaScript / Functional',   difficulty: 'hard',   level: 'middle',  title: 'Curry Function' },
  { topic: 'JavaScript / Promise',      difficulty: 'hard',   level: 'middle',  title: 'Implement Promise.all' },
  { topic: 'JavaScript / Cache',        difficulty: 'medium', level: 'junior',  title: 'Memoize' },
  { topic: 'JavaScript / Recursion',    difficulty: 'hard',   level: 'middle',  title: 'Deep Clone' },
  { topic: 'JavaScript / Design Pattern', difficulty: 'hard', level: 'middle',  title: 'Event Emitter' },
  { topic: 'JavaScript / Array',        difficulty: 'medium', level: 'junior',  title: 'Flatten Nested Array' },

  // ─── React Hooks ─────────────────────────────────────────────────────────────
  { topic: 'React / Hooks',             difficulty: 'medium', level: 'junior',  title: 'useLocalStorage Hook' },
  { topic: 'React / Hooks / Async',     difficulty: 'medium', level: 'junior',  title: 'useFetch Hook' },
  { topic: 'React / Hooks',             difficulty: 'medium', level: 'middle',  title: 'useDebounce Hook' },
  { topic: 'React / Hooks',             difficulty: 'hard',   level: 'middle',  title: 'useIntersectionObserver Hook' },
];

// Special cases: same topic/difficulty/level — match by content keyword
const CONTENT_KEYWORD_MAP = [
  { keyword: 'Linked List Cycle\|cycle trong Linked', title: 'Linked List Cycle' },
  { keyword: 'node giữa', title: 'Middle of the Linked List' },
  { keyword: 'Validate.*Binary Search Tree\|BST hợp lệ', title: 'Validate Binary Search Tree' },
  { keyword: 'Lowest Common Ancestor\|LCA', title: 'Lowest Common Ancestor of a BST' },
  { keyword: 'đối xứng.*symmetric\|symmetric.*đối xứng', title: 'Symmetric Tree' },
  { keyword: 'Maximum Depth\|chiều cao.*max depth', title: 'Maximum Depth of Binary Tree' },
  { keyword: 'Coin Change\|mệnh giá.*coins', title: 'Coin Change' },
  { keyword: 'Climbing Stairs\|bậc thang', title: 'Climbing Stairs' },
  { keyword: 'Longest Increasing\|LIS', title: 'Longest Increasing Subsequence' },
  { keyword: '0/1 Knapsack\|Knapsack\|weight.*value.*capacity', title: '0/1 Knapsack' },
  { keyword: 'Longest Common Subsequence\|LCS', title: 'Longest Common Subsequence' },
  { keyword: 'Reverse Linked List\|Đảo ngược.*Linked List', title: 'Reverse Linked List' },
  { keyword: 'Merge Two.*Sorted.*List\|Merge hai.*sorted', title: 'Merge Two Sorted Lists' },
  { keyword: 'throttle', title: 'Throttle' },
  { keyword: 'debounce', title: 'Debounce' },
  { keyword: 'useFetch', title: 'useFetch Hook' },
  { keyword: 'useLocalStorage', title: 'useLocalStorage Hook' },
  { keyword: 'useDebounce', title: 'useDebounce Hook' },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let updated = 0;
  let skipped = 0;

  const questions = await Question.find({ type: 'coding', title: { $exists: false } });
  console.log(`Found ${questions.length} coding questions without title`);

  for (const q of questions) {
    // Try content keyword match first (for ambiguous topic/difficulty/level combos)
    let matched = false;
    for (const { keyword, title } of CONTENT_KEYWORD_MAP) {
      const re = new RegExp(keyword, 'i');
      if (re.test(q.content)) {
        await Question.findByIdAndUpdate(q._id, { title });
        console.log(`  ✓ [content match] ${title}`);
        updated++;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Try topic/difficulty/level match
    const entry = TITLE_MAP.find(
      (e) => e.topic === q.topic && e.difficulty === q.difficulty && e.level === q.level
    );
    if (entry) {
      await Question.findByIdAndUpdate(q._id, { title: entry.title });
      console.log(`  ✓ [topic match]   ${entry.title}`);
      updated++;
    } else {
      console.log(`  ⚠ no match: topic="${q.topic}" diff="${q.difficulty}" level="${q.level}"`);
      skipped++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
