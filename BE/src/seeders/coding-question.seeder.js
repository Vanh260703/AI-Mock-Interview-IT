const Question = require('../models/question.model');

const codingQuestions = [
  // ─── Array / Hash Map (10) ──────────────────────────────────────────────────
  {
    content: `Cho mảng số nguyên \`nums\` và số nguyên \`target\`, trả về **chỉ số** của hai phần tử có tổng bằng \`target\`.

**Input:** \`nums\` — mảng số nguyên, \`target\` — số nguyên
**Output:** mảng \`[i, j]\` với \`nums[i] + nums[j] === target\`

\`\`\`
Ví dụ 1:
  Input:  nums = [2, 7, 11, 15], target = 9
  Output: [0, 1]
  // nums[0] + nums[1] = 2 + 7 = 9 ✓
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [3, 2, 4], target = 6
  Output: [1, 2]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  nums = [3, 3], target = 6
  Output: [0, 1]
\`\`\`

**Ràng buộc:**
- 2 ≤ nums.length ≤ 10⁴
- Mỗi input có đúng một nghiệm
- Không được dùng cùng một phần tử hai lần
- Yêu cầu: O(n) time`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Array / Hash Map', role: 'General', level: 'intern',
    tags: ['array', 'hash map', 'algorithm', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}`,
    hints: ['Dùng HashMap lưu value → index', 'Tại mỗi bước kiểm tra complement = target - nums[i]'],
  },
  {
    content: `Cho mảng số nguyên \`nums\`, tìm **tổng lớn nhất** của một mảng con liên tiếp (ít nhất 1 phần tử).

**Input:** \`nums\` — mảng số nguyên (có thể âm)
**Output:** số nguyên — tổng lớn nhất

\`\`\`
Ví dụ 1:
  Input:  nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
  Output: 6
  // Mảng con [4, -1, 2, 1] có tổng = 6
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [1]
  Output: 1
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  nums = [5, 4, -1, 7, 8]
  Output: 23
\`\`\`

**Ràng buộc:**
- 1 ≤ nums.length ≤ 10⁵
- -10⁴ ≤ nums[i] ≤ 10⁴
- Yêu cầu: O(n) time — Kadane's Algorithm`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Dynamic Programming / Array', role: 'General', level: 'junior',
    tags: ['dynamic programming', 'array', 'kadane', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let current = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    maxSum = Math.max(maxSum, current);
  }
  return maxSum;
}`,
    hints: ['Tại mỗi vị trí: bắt đầu lại hay tiếp tục?', 'current = max(nums[i], current + nums[i])'],
  },
  {
    content: `Cho mảng số nguyên \`nums\`, trả về mảng \`result\` sao cho \`result[i]\` bằng **tích của tất cả phần tử** trong \`nums\` **trừ** \`nums[i]\`.

**Input:** \`nums\` — mảng số nguyên
**Output:** mảng số nguyên

\`\`\`
Ví dụ 1:
  Input:  nums = [1, 2, 3, 4]
  Output: [24, 12, 8, 6]
  // result[0] = 2*3*4 = 24, result[1] = 1*3*4 = 12, ...
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [-1, 1, 0, -3, 3]
  Output: [0, 0, 9, 0, 0]
\`\`\`

**Ràng buộc:**
- 2 ≤ nums.length ≤ 10⁵
- **Không được dùng phép chia**
- O(n) time, O(1) extra space (không tính output array)`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Array / Prefix Product', role: 'General', level: 'middle',
    tags: ['array', 'prefix product', 'algorithm', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  return result;
}`,
    hints: ['Pass 1: tích prefix (trái → phải)', 'Pass 2: nhân thêm suffix (phải → trái)'],
  },
  {
    content: `Cho mảng số nguyên **chưa sắp xếp** \`nums\`, tìm **độ dài** của chuỗi số liên tiếp dài nhất.

**Input:** \`nums\` — mảng số nguyên
**Output:** số nguyên

\`\`\`
Ví dụ 1:
  Input:  nums = [100, 4, 200, 1, 3, 2]
  Output: 4
  // Chuỗi dài nhất: [1, 2, 3, 4]
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]
  Output: 9
  // Chuỗi: [0, 1, 2, 3, 4, 5, 6, 7, 8]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  nums = []
  Output: 0
\`\`\`

**Ràng buộc:**
- 0 ≤ nums.length ≤ 10⁵
- Yêu cầu: O(n) time`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Hash Set / Array', role: 'General', level: 'middle',
    tags: ['hash set', 'array', 'algorithm', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function longestConsecutive(nums) {
  const set = new Set(nums);
  let longest = 0;
  for (const num of set) {
    if (!set.has(num - 1)) {
      let len = 1;
      while (set.has(num + len)) len++;
      longest = Math.max(longest, len);
    }
  }
  return longest;
}`,
    hints: ['Dùng Set để tra cứu O(1)', 'Chỉ bắt đầu đếm khi num-1 không có trong Set'],
  },
  {
    content: `Cho mảng các khoảng \`intervals = [[start, end], ...]\`, **merge** các khoảng chồng lấp nhau.

**Input:** \`intervals\` — mảng các khoảng [start, end]
**Output:** mảng các khoảng sau khi merge

\`\`\`
Ví dụ 1:
  Input:  intervals = [[1,3],[2,6],[8,10],[15,18]]
  Output: [[1,6],[8,10],[15,18]]
  // [1,3] và [2,6] chồng lên nhau → merge thành [1,6]
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  intervals = [[1,4],[4,5]]
  Output: [[1,5]]
  // [1,4] và [4,5] chạm nhau → merge thành [1,5]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  intervals = [[1,4],[2,3]]
  Output: [[1,4]]
\`\`\`

**Ràng buộc:**
- 1 ≤ intervals.length ≤ 10⁴
- intervals[i].length === 2
- 0 ≤ start ≤ end ≤ 10⁴`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Array / Sorting', role: 'General', level: 'junior',
    tags: ['array', 'sorting', 'interval', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      result.push(intervals[i]);
    }
  }
  return result;
}`,
    hints: ['Sort theo start time trước', 'So sánh start của interval hiện tại với end của interval cuối'],
  },
  {
    content: `Gom nhóm các **anagram** với nhau từ mảng chuỗi \`strs\`.

**Input:** \`strs\` — mảng chuỗi chữ thường
**Output:** mảng 2D — mỗi nhóm chứa các anagram của nhau

\`\`\`
Ví dụ 1:
  Input:  strs = ["eat","tea","tan","ate","nat","bat"]
  Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
  // (thứ tự trong output không quan trọng)
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  strs = [""]
  Output: [[""]]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  strs = ["a"]
  Output: [["a"]]
\`\`\`

**Ràng buộc:**
- 1 ≤ strs.length ≤ 10⁴
- 0 ≤ strs[i].length ≤ 100
- strs[i] chỉ gồm chữ cái thường`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Hash Map / String', role: 'General', level: 'junior',
    tags: ['string', 'hash map', 'sorting', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.values()];
}`,
    hints: ['Sort từng string để tạo key', 'Map: sorted_string → [anagrams]'],
  },
  {
    content: `Cho mảng số nguyên \`nums\`, trả về phần tử xuất hiện **nhiều hơn n/2 lần** (majority element).

**Input:** \`nums\` — mảng số nguyên có độ dài \`n\`
**Output:** số nguyên — majority element

\`\`\`
Ví dụ 1:
  Input:  nums = [3, 2, 3]
  Output: 3
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [2, 2, 1, 1, 1, 2, 2]
  Output: 2
  // 2 xuất hiện 4 lần > 7/2 = 3.5
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  nums = [6, 5, 5]
  Output: 5
\`\`\`

**Ràng buộc:**
- n ≥ 1, majority element luôn tồn tại
- Yêu cầu: O(n) time, **O(1) space** — Boyer-Moore Voting`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Array / Voting Algorithm', role: 'General', level: 'junior',
    tags: ['array', 'boyer-moore voting', 'algorithm', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `function majorityElement(nums) {
  let candidate = null, count = 0;
  for (const num of nums) {
    if (count === 0) candidate = num;
    count += num === candidate ? 1 : -1;
  }
  return candidate;
}`,
    hints: ["Boyer-Moore Voting", 'count bị triệt tiêu → đổi candidate'],
  },
  {
    content: `Cho mảng \`height[]\` biểu diễn chiều cao các cột, tìm **hai cột** tạo ra bể chứa **nhiều nước nhất**.

**Input:** \`height\` — mảng số nguyên không âm
**Output:** số nguyên — diện tích lớn nhất

\`\`\`
Ví dụ 1:
  Input:  height = [1, 8, 6, 2, 5, 4, 8, 3, 7]
  Output: 49
  // Cột 1 (h=8) và cột 8 (h=7): min(8,7) * (8-1) = 49
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  height = [1, 1]
  Output: 1
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  height = [4, 3, 2, 1, 4]
  Output: 16
\`\`\`

**Ràng buộc:**
- 2 ≤ height.length ≤ 10⁵
- 0 ≤ height[i] ≤ 10⁴
- Yêu cầu: O(n) — Two Pointer`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Two Pointers', role: 'General', level: 'junior',
    tags: ['two pointers', 'array', 'greedy', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `function maxArea(height) {
  let left = 0, right = height.length - 1, max = 0;
  while (left < right) {
    const water = Math.min(height[left], height[right]) * (right - left);
    max = Math.max(max, water);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return max;
}`,
    hints: ['Two pointer từ hai đầu', 'Di chuyển pointer có chiều cao thấp hơn'],
  },
  {
    content: `Xoay mảng sang **phải** \`k\` bước. Thực hiện **in-place** (không tạo mảng mới).

**Input:** \`nums\` — mảng số nguyên, \`k\` — số bước xoay
**Output:** mảng đã xoay (in-place, không cần return)

\`\`\`
Ví dụ 1:
  Input:  nums = [1,2,3,4,5,6,7], k = 3
  Output: [5,6,7,1,2,3,4]
  // Xoay phải 3 bước: [7,1,2,3,4,5,6] → [6,7,1,2,3,4,5] → [5,6,7,1,2,3,4]
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [-1,-100,3,99], k = 2
  Output: [3,99,-1,-100]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  nums = [1,2], k = 5
  Output: [2,1]
  // k = 5 % 2 = 1
\`\`\`

**Ràng buộc:**
- 1 ≤ nums.length ≤ 10⁵
- -2³¹ ≤ nums[i] ≤ 2³¹ - 1
- 0 ≤ k ≤ 10⁵
- **Hint:** Reverse 3 lần`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Array / In-place', role: 'General', level: 'junior',
    tags: ['array', 'in-place', 'reverse', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function rotate(nums, k) {
  k = k % nums.length;
  const rev = (l, r) => {
    while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; l++; r--; }
  };
  rev(0, nums.length - 1);
  rev(0, k - 1);
  rev(k, nums.length - 1);
}`,
    hints: ['k = k % n để tránh k > n', 'Reverse toàn bộ → reverse [0..k-1] → reverse [k..n-1]'],
  },
  {
    content: `Tìm ký tự **đầu tiên không lặp lại** trong chuỗi. Trả về **index**, hoặc \`-1\` nếu không có.

**Input:** \`s\` — chuỗi chỉ gồm chữ cái thường
**Output:** số nguyên — index của ký tự đầu tiên không lặp lại

\`\`\`
Ví dụ 1:
  Input:  s = "leetcode"
  Output: 0
  // 'l' xuất hiện 1 lần, là ký tự đầu tiên không lặp
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  s = "loveleetcode"
  Output: 2
  // 'v' tại index 2 là ký tự đầu tiên không lặp
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  s = "aabb"
  Output: -1
\`\`\`

**Ràng buộc:**
- 1 ≤ s.length ≤ 10⁵
- s chỉ gồm chữ cái thường`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'String / Hash Map', role: 'General', level: 'intern',
    tags: ['string', 'hash map', 'algorithm', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `function firstUniqChar(s) {
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (let i = 0; i < s.length; i++) {
    if (count[s[i]] === 1) return i;
  }
  return -1;
}`,
    hints: ['Pass 1: đếm tần suất', 'Pass 2: tìm ký tự đầu tiên có count = 1'],
  },

  // ─── String (5) ─────────────────────────────────────────────────────────────
  {
    content: `Kiểm tra chuỗi có phải **palindrome** không — bỏ qua ký tự không phải chữ/số, không phân biệt hoa thường.

**Input:** \`s\` — chuỗi bất kỳ
**Output:** \`true\` / \`false\`

\`\`\`
Ví dụ 1:
  Input:  s = "A man, a plan, a canal: Panama"
  Output: true
  // Sau khi làm sạch: "amanaplanacanalpanama" — đối xứng
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  s = "race a car"
  Output: false
  // Sau khi làm sạch: "raceacar" — không đối xứng
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  s = " "
  Output: true
\`\`\`

**Ràng buộc:**
- 1 ≤ s.length ≤ 2 × 10⁵
- s gồm các ký tự ASCII in được`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'String / Two Pointers', role: 'General', level: 'intern',
    tags: ['string', 'two pointers', 'palindrome', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++; right--;
  }
  return true;
}`,
    hints: ['Làm sạch chuỗi với regex /[^a-z0-9]/g', 'Two pointer từ hai đầu vào giữa'],
  },
  {
    content: `Tìm độ dài của **chuỗi con không có ký tự lặp lại** dài nhất.

**Input:** \`s\` — chuỗi bất kỳ
**Output:** số nguyên — độ dài lớn nhất

\`\`\`
Ví dụ 1:
  Input:  s = "abcabcbb"
  Output: 3
  // Chuỗi con: "abc"
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  s = "bbbbb"
  Output: 1
  // Chuỗi con: "b"
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  s = "pwwkew"
  Output: 3
  // Chuỗi con: "wke"
\`\`\`

**Ràng buộc:**
- 0 ≤ s.length ≤ 5 × 10⁴
- Yêu cầu: O(n) — Sliding Window`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Sliding Window / String', role: 'General', level: 'junior',
    tags: ['string', 'sliding window', 'hash map', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let max = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right]) && map.get(s[right]) >= left) {
      left = map.get(s[right]) + 1;
    }
    map.set(s[right], right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}`,
    hints: ['Sliding window với left/right pointer', 'Map lưu index gần nhất của mỗi ký tự'],
  },
  {
    content: `Tạo ra tất cả **hoán vị** của chuỗi \`s\`.

**Input:** \`s\` — chuỗi chỉ gồm ký tự phân biệt
**Output:** mảng tất cả các hoán vị

\`\`\`
Ví dụ 1:
  Input:  s = "abc"
  Output: ["abc","acb","bac","bca","cab","cba"]
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  s = "ab"
  Output: ["ab","ba"]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  s = "a"
  Output: ["a"]
\`\`\`

**Ràng buộc:**
- 1 ≤ s.length ≤ 6
- Tất cả ký tự trong s là phân biệt
- Kết quả có thể theo bất kỳ thứ tự nào`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'Backtracking / String', role: 'General', level: 'middle',
    tags: ['backtracking', 'recursion', 'string', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `function permutations(s) {
  const result = [];
  const used = new Array(s.length).fill(false);
  const backtrack = (current) => {
    if (current.length === s.length) { result.push(current); return; }
    for (let i = 0; i < s.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      backtrack(current + s[i]);
      used[i] = false;
    }
  };
  backtrack('');
  return result;
}`,
    hints: ['Backtracking với mảng used[]', 'Base case: current.length === s.length'],
  },
  {
    content: `Cho chuỗi gồm các ký tự \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\`, \`']'\`, kiểm tra xem chuỗi có **hợp lệ** không.

**Input:** \`s\` — chuỗi gồm các bracket
**Output:** \`true\` / \`false\`

\`\`\`
Ví dụ 1:
  Input:  s = "()"
  Output: true
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  s = "()[]{}"
  Output: true
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  s = "(]"
  Output: false
\`\`\`
\`\`\`
Ví dụ 4:
  Input:  s = "([)]"
  Output: false
\`\`\`

**Ràng buộc:**
- 1 ≤ s.length ≤ 10⁴
- s chỉ gồm 6 loại ký tự bracket`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Stack / String', role: 'General', level: 'intern',
    tags: ['stack', 'string', 'parentheses', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if ('({['.includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}`,
    hints: ['Push khi gặp bracket mở, pop khi gặp bracket đóng', 'Map: đóng → mở tương ứng'],
  },
  {
    content: `Cho chuỗi \`s\` và dictionary \`wordDict\`, kiểm tra xem \`s\` có thể **phân tách thành các từ** trong \`wordDict\` không.

**Input:** \`s\` — chuỗi, \`wordDict\` — mảng các từ
**Output:** \`true\` / \`false\`

\`\`\`
Ví dụ 1:
  Input:  s = "leetcode", wordDict = ["leet","code"]
  Output: true
  // "leetcode" = "leet" + "code"
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  s = "applepenapple", wordDict = ["apple","pen"]
  Output: true
  // "apple" + "pen" + "apple"
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
  Output: false
\`\`\`

**Ràng buộc:**
- 1 ≤ s.length ≤ 300
- wordDict không có từ trùng lặp`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'Dynamic Programming / String', role: 'General', level: 'senior',
    tags: ['dynamic programming', 'string', 'coding'],
    expectedDuration: 540,
    sampleAnswer: `function wordBreak(s, wordDict) {
  const set = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && set.has(s.slice(j, i))) { dp[i] = true; break; }
    }
  }
  return dp[s.length];
}`,
    hints: ['dp[i] = true nếu s[0..i] phân tách được', 'Thử tất cả j: dp[j] && s[j..i] trong dict'],
  },

  // ─── Linked List (4) ────────────────────────────────────────────────────────
  {
    content: `Đảo ngược một **Linked List**.

**Định nghĩa Node:**
\`\`\`js
// class ListNode {
//   constructor(val, next = null) {
//     this.val = val;
//     this.next = next;
//   }
// }
\`\`\`

\`\`\`
Ví dụ 1:
  Input:  1 → 2 → 3 → 4 → 5 → null
  Output: 5 → 4 → 3 → 2 → 1 → null
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  1 → 2 → null
  Output: 2 → 1 → null
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  null
  Output: null
\`\`\`

**Ràng buộc:**
- 0 ≤ số node ≤ 5000
- Yêu cầu: O(n) time, O(1) space — iterative`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Linked List', role: 'General', level: 'fresher',
    tags: ['linked list', 'two pointers', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function reverseList(head) {
  let prev = null, cur = head;
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}`,
    hints: ['3 pointer: prev, cur, next', 'cur.next = prev → advance prev = cur → advance cur = next'],
  },
  {
    content: `Phát hiện **cycle** trong Linked List.

\`\`\`
Ví dụ 1:
  Input:  3 → 2 → 0 → -4
                ↑_________↑  (tail nối về node index 1)
  Output: true
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  1 → 2
          ↑___↑  (tail nối về node index 0)
  Output: true
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  1 → null
  Output: false
\`\`\`

**Ràng buộc:**
- 0 ≤ số node ≤ 10⁴
- Yêu cầu: **O(1) space** — Floyd's Tortoise & Hare`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Linked List / Two Pointers', role: 'General', level: 'fresher',
    tags: ['linked list', 'two pointers', 'cycle detection', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    hints: ['slow đi 1 bước, fast đi 2 bước', 'Nếu slow === fast thì có cycle'],
  },
  {
    content: `Tìm **node giữa** của Linked List. Nếu có 2 node giữa, trả về node thứ hai.

\`\`\`
Ví dụ 1:
  Input:  1 → 2 → 3 → 4 → 5 → null
  Output: node(3)   // [3,4,5]
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  1 → 2 → 3 → 4 → 5 → 6 → null
  Output: node(4)   // [4,5,6]
  // Có 2 node giữa (3 và 4), trả về node thứ hai
\`\`\`

**Ràng buộc:**
- 1 ≤ số node ≤ 100
- Yêu cầu: O(n) time, O(1) space — slow/fast pointer`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Linked List / Two Pointers', role: 'General', level: 'intern',
    tags: ['linked list', 'two pointers', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`,
    hints: ['slow đi 1 bước, fast đi 2 bước', 'Khi fast đến cuối, slow đang ở giữa'],
  },
  {
    content: `Merge hai **sorted linked list** thành một sorted linked list.

\`\`\`
Ví dụ 1:
  Input:  l1 = 1 → 2 → 4 → null
          l2 = 1 → 3 → 4 → null
  Output: 1 → 1 → 2 → 3 → 4 → 4 → null
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  l1 = null, l2 = null
  Output: null
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  l1 = null, l2 = 0 → null
  Output: 0 → null
\`\`\`

**Ràng buộc:**
- 0 ≤ số node mỗi list ≤ 50
- -100 ≤ Node.val ≤ 100
- Cả hai list đã sắp xếp tăng dần`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Linked List', role: 'General', level: 'intern',
    tags: ['linked list', 'sorting', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function mergeTwoLists(l1, l2) {
  const dummy = { next: null };
  let cur = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }
    else { cur.next = l2; l2 = l2.next; }
    cur = cur.next;
  }
  cur.next = l1 ?? l2;
  return dummy.next;
}`,
    hints: ['Dùng dummy node để đơn giản hoá', 'Append phần còn lại sau khi một list hết'],
  },

  // ─── Tree (5) ────────────────────────────────────────────────────────────────
  {
    content: `Tính **chiều cao (max depth)** của Binary Tree.

**Định nghĩa Node:**
\`\`\`js
// class TreeNode { constructor(val, left=null, right=null) { ... } }
\`\`\`

\`\`\`
Ví dụ 1:
  Input:
        3
       / \\
      9  20
         / \\
        15   7
  Output: 3
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  1 → 2 (chỉ có right child)
  Output: 2
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  null
  Output: 0
\`\`\`

**Ràng buộc:**
- 0 ≤ số node ≤ 10⁴
- -100 ≤ Node.val ≤ 100`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Tree / DFS', role: 'General', level: 'junior',
    tags: ['tree', 'recursion', 'dfs', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
    hints: ['Base case: root === null → 0', 'height = 1 + max(left, right)'],
  },
  {
    content: `**Level-order traversal** của Binary Tree — trả về mảng 2D theo từng level.

\`\`\`
Ví dụ 1:
  Input:
        3
       / \\
      9  20
         / \\
        15   7
  Output: [[3],[9,20],[15,7]]
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  1
  Output: [[1]]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  null
  Output: []
\`\`\`

**Ràng buộc:**
- 0 ≤ số node ≤ 2000
- Yêu cầu: BFS với Queue`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Tree / BFS', role: 'General', level: 'junior',
    tags: ['tree', 'bfs', 'queue', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const level = [], size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`,
    hints: ['BFS với Queue', 'Xử lý đúng size của queue tại đầu mỗi level'],
  },
  {
    content: `Validate **Binary Search Tree** — kiểm tra cây có phải BST hợp lệ không.

**BST:** mọi node ở subtree trái < node hiện tại < mọi node ở subtree phải.

\`\`\`
Ví dụ 1:
  Input:
      2
     / \\
    1   3
  Output: true
\`\`\`
\`\`\`
Ví dụ 2:
  Input:
      5
     / \\
    1   4
       / \\
      3   6
  Output: false
  // Node 4 < 5 nhưng nằm ở right subtree → vi phạm BST
\`\`\`

**Ràng buộc:**
- 1 ≤ số node ≤ 10⁴
- -2³¹ ≤ Node.val ≤ 2³¹ - 1`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Tree / BST', role: 'General', level: 'middle',
    tags: ['tree', 'bst', 'recursion', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val)
      && isValidBST(root.right, root.val, max);
}`,
    hints: ['Pass min/max bounds vào đệ quy', 'Left: max = root.val, Right: min = root.val'],
  },
  {
    content: `Tìm **Lowest Common Ancestor (LCA)** của hai node \`p\` và \`q\` trong Binary Search Tree.

\`\`\`
Ví dụ 1:
  Input:
        6
       / \\
      2   8
     / \\ / \\
    0  4 7  9
      / \\
     3   5
  p = 2, q = 8
  Output: 6
  // 6 là node thấp nhất chứa cả 2 và 8 trong subtree
\`\`\`
\`\`\`
Ví dụ 2:
  Input: cây trên, p = 2, q = 4
  Output: 2
  // 2 là ancestor của chính nó và 4
\`\`\`

**Ràng buộc:**
- 2 ≤ số node ≤ 10⁵
- p và q luôn tồn tại trong cây và p ≠ q`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Tree / BST', role: 'General', level: 'middle',
    tags: ['tree', 'bst', 'lca', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function lowestCommonAncestor(root, p, q) {
  if (p.val < root.val && q.val < root.val) {
    return lowestCommonAncestor(root.left, p, q);
  }
  if (p.val > root.val && q.val > root.val) {
    return lowestCommonAncestor(root.right, p, q);
  }
  return root;
}`,
    hints: ['Nếu cả p,q < root → LCA nằm ở left', 'Nếu cả p,q > root → LCA nằm ở right', 'Ngược lại root chính là LCA'],
  },
  {
    content: `Cho Binary Tree, kiểm tra xem nó có phải **cây đối xứng** (symmetric / mirror) không.

\`\`\`
Ví dụ 1:
  Input:
        1
       / \\
      2   2
     / \\ / \\
    3  4 4  3
  Output: true
\`\`\`
\`\`\`
Ví dụ 2:
  Input:
        1
       / \\
      2   2
       \\   \\
        3   3
  Output: false
\`\`\`

**Ràng buộc:**
- 1 ≤ số node ≤ 1000
- Cần kiểm tra cả về cấu trúc lẫn giá trị`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Tree / DFS', role: 'General', level: 'junior',
    tags: ['tree', 'recursion', 'dfs', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function isSymmetric(root) {
  const mirror = (left, right) => {
    if (!left && !right) return true;
    if (!left || !right) return false;
    return left.val === right.val
      && mirror(left.left, right.right)
      && mirror(left.right, right.left);
  };
  return mirror(root.left, root.right);
}`,
    hints: ['So sánh left.left với right.right và left.right với right.left', 'Base case: cả hai null → true, một null → false'],
  },

  // ─── Sorting & Searching (4) ────────────────────────────────────────────────
  {
    content: `Implement **Binary Search**. Tìm index của \`target\` trong mảng đã sắp xếp. Trả về \`-1\` nếu không tìm thấy.

**Input:** \`arr\` — mảng số nguyên tăng dần, \`target\` — số nguyên cần tìm
**Output:** index hoặc -1

\`\`\`
Ví dụ 1:
  Input:  arr = [1, 3, 5, 7, 9, 11], target = 7
  Output: 3
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  arr = [1, 3, 5, 7, 9, 11], target = 6
  Output: -1
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  arr = [5], target = 5
  Output: 0
\`\`\`

**Ràng buộc:**
- 1 ≤ arr.length ≤ 10⁴
- Phần tử phân biệt, đã sort tăng dần
- Yêu cầu: O(log n)`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Binary Search', role: 'General', level: 'intern',
    tags: ['binary search', 'array', 'algorithm', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    hints: ['mid = left + (right - left) / 2 để tránh overflow', 'Điều kiện: left <= right'],
  },
  {
    content: `Implement **Merge Sort**.

**Input:** \`arr\` — mảng số nguyên
**Output:** mảng đã sắp xếp (mảng mới)

\`\`\`
Ví dụ 1:
  Input:  arr = [5, 3, 8, 1, 2]
  Output: [1, 2, 3, 5, 8]
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  arr = [64, 34, 25, 12, 22, 11, 90]
  Output: [11, 12, 22, 25, 34, 64, 90]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  arr = [1]
  Output: [1]
\`\`\`

**Ràng buộc:**
- 1 ≤ arr.length ≤ 10⁴
- Yêu cầu: O(n log n) time, Divide & Conquer`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Sorting', role: 'General', level: 'junior',
    tags: ['sorting', 'divide and conquer', 'recursion', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
    hints: ['Chia đôi → sort từng nửa → merge', 'Hàm merge: two pointer so sánh từng phần tử'],
  },
  {
    content: `Tìm **K phần tử lớn nhất** trong mảng.

**Input:** \`nums\` — mảng số nguyên, \`k\` — số phần tử cần tìm
**Output:** số nguyên — phần tử lớn thứ k (1-indexed)

\`\`\`
Ví dụ 1:
  Input:  nums = [3,2,1,5,6,4], k = 2
  Output: 5
  // Phần tử lớn thứ 2 là 5
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [3,2,3,1,2,4,5,5,6], k = 4
  Output: 4
  // Sorted desc: [6,5,5,4,3,3,2,2,1] → index 3 = 4
\`\`\`

**Ràng buộc:**
- 1 ≤ k ≤ nums.length ≤ 10⁴
- -10⁴ ≤ nums[i] ≤ 10⁴
- Thử implement bằng QuickSelect O(n) average`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Sorting / QuickSelect', role: 'General', level: 'middle',
    tags: ['sorting', 'quickselect', 'algorithm', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function findKthLargest(nums, k) {
  // Simple approach: sort desc
  nums.sort((a, b) => b - a);
  return nums[k - 1];
}

// QuickSelect O(n) average:
function findKthLargestQS(nums, k) {
  const target = nums.length - k;
  function partition(lo, hi) {
    const pivot = nums[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (nums[j] <= pivot) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; }
    }
    [nums[i], nums[hi]] = [nums[hi], nums[i]];
    return i;
  }
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const pi = partition(lo, hi);
    if (pi === target) return nums[pi];
    if (pi < target) lo = pi + 1;
    else hi = pi - 1;
  }
  return nums[lo];
}`,
    hints: ['Sort giảm dần rồi lấy index k-1', 'QuickSelect: tìm partition index = n-k'],
  },
  {
    content: `Tìm **phần tử bị thiếu** trong mảng \`[0, 1, 2, ..., n]\` chứa đúng n số phân biệt từ 0 đến n.

**Input:** \`nums\` — mảng n số nguyên
**Output:** số nguyên bị thiếu

\`\`\`
Ví dụ 1:
  Input:  nums = [3, 0, 1]
  Output: 2
  // Range 0..3, thiếu 2
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [0, 1]
  Output: 2
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  nums = [9,6,4,2,3,5,7,0,1]
  Output: 8
\`\`\`

**Ràng buộc:**
- n = nums.length
- 0 ≤ nums[i] ≤ n, tất cả phân biệt
- Yêu cầu: O(n) time, O(1) space`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Math / Array', role: 'General', level: 'intern',
    tags: ['array', 'math', 'bit manipulation', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `function missingNumber(nums) {
  const n = nums.length;
  const expected = n * (n + 1) / 2;
  const actual = nums.reduce((sum, x) => sum + x, 0);
  return expected - actual;
}`,
    hints: ['Tổng lý thuyết 0..n = n*(n+1)/2', 'Phần tử thiếu = tổng lý thuyết - tổng thực tế'],
  },

  // ─── Dynamic Programming (5) ────────────────────────────────────────────────
  {
    content: `**Climbing Stairs:** Có \`n\` bậc thang, mỗi lần leo được 1 hoặc 2 bậc. Tính **số cách** để leo lên bậc \`n\`.

**Input:** \`n\` — số nguyên dương
**Output:** số nguyên

\`\`\`
Ví dụ 1:
  Input:  n = 2
  Output: 2
  // Cách 1: 1+1, Cách 2: 2
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  n = 3
  Output: 3
  // Cách 1: 1+1+1, Cách 2: 1+2, Cách 3: 2+1
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  n = 5
  Output: 8
\`\`\`

**Ràng buộc:**
- 1 ≤ n ≤ 45
- Yêu cầu: O(n) time, O(1) space`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Dynamic Programming', role: 'General', level: 'intern',
    tags: ['dynamic programming', 'fibonacci', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev = 1, cur = 2;
  for (let i = 3; i <= n; i++) {
    [prev, cur] = [cur, prev + cur];
  }
  return cur;
}`,
    hints: ['f(n) = f(n-1) + f(n-2) — giống Fibonacci', 'Dùng 2 biến để O(1) space'],
  },
  {
    content: `**Coin Change:** Cho mảng mệnh giá \`coins\` và số tiền \`amount\`, tìm số đồng xu **ít nhất** để đạt \`amount\`. Trả về \`-1\` nếu không thể.

**Input:** \`coins\` — mảng mệnh giá, \`amount\` — số tiền mục tiêu
**Output:** số đồng xu tối thiểu, hoặc -1

\`\`\`
Ví dụ 1:
  Input:  coins = [1, 5, 11], amount = 15
  Output: 3
  // 5 + 5 + 5 = 15 (tối ưu hơn 11+1+1+1+1 = 5 đồng)
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  coins = [2], amount = 3
  Output: -1
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  coins = [1, 2, 5], amount = 11
  Output: 3
  // 5 + 5 + 1
\`\`\`

**Ràng buộc:**
- 1 ≤ coins.length ≤ 12
- 1 ≤ amount ≤ 10⁴`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Dynamic Programming', role: 'General', level: 'middle',
    tags: ['dynamic programming', 'bfs', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    hints: ['dp[i] = min coins để đạt amount i', 'dp[i] = min(dp[i - coin] + 1) với mỗi coin'],
  },
  {
    content: `**Longest Increasing Subsequence (LIS):** Tìm độ dài dãy con tăng dần dài nhất (không nhất thiết liên tiếp).

**Input:** \`nums\` — mảng số nguyên
**Output:** số nguyên — độ dài LIS

\`\`\`
Ví dụ 1:
  Input:  nums = [10, 9, 2, 5, 3, 7, 101, 18]
  Output: 4
  // LIS: [2, 3, 7, 101] hoặc [2, 5, 7, 101]
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  nums = [0, 1, 0, 3, 2, 3]
  Output: 4
  // LIS: [0, 1, 2, 3]
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  nums = [7, 7, 7]
  Output: 1
\`\`\`

**Ràng buộc:**
- 1 ≤ nums.length ≤ 2500
- Bonus: O(n log n) với Binary Search`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Dynamic Programming', role: 'General', level: 'middle',
    tags: ['dynamic programming', 'binary search', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  let max = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    max = Math.max(max, dp[i]);
  }
  return max;
}`,
    hints: ['dp[i] = LIS kết thúc tại index i', 'dp[i] = max(dp[j]+1) với j < i && nums[j] < nums[i]'],
  },
  {
    content: `**0/1 Knapsack:** Có n item, mỗi item có \`weight[i]\` và \`value[i]\`. Với sức chứa \`W\`, tìm tổng value **lớn nhất** (mỗi item dùng tối đa 1 lần).

**Input:** \`weights\`, \`values\` — mảng số nguyên, \`W\` — capacity
**Output:** số nguyên — tổng value tối đa

\`\`\`
Ví dụ 1:
  Input:
    weights = [2, 3, 4, 5]
    values  = [3, 4, 5, 6]
    W = 5
  Output: 7
  // Lấy item 0 (w=2,v=3) + item 1 (w=3,v=4) → tổng w=5, v=7
\`\`\`
\`\`\`
Ví dụ 2:
  Input:
    weights = [1, 2, 3]
    values  = [6, 10, 12]
    W = 5
  Output: 22
  // Lấy item 1 + item 2: w=5, v=22
\`\`\`

**Ràng buộc:**
- 1 ≤ n ≤ 500
- 0 ≤ weight[i], W ≤ 1000`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'Dynamic Programming', role: 'General', level: 'senior',
    tags: ['dynamic programming', 'knapsack', 'coding'],
    expectedDuration: 600,
    sampleAnswer: `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w];
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1]);
      }
    }
  }
  return dp[n][W];
}`,
    hints: ['dp[i][w] = max value với i items và capacity w', 'Mỗi item: lấy (nếu đủ chỗ) hoặc bỏ'],
  },
  {
    content: `**Longest Common Subsequence (LCS):** Tìm độ dài chuỗi con chung dài nhất của 2 chuỗi.

**Input:** \`s1\`, \`s2\` — hai chuỗi
**Output:** số nguyên — độ dài LCS

\`\`\`
Ví dụ 1:
  Input:  s1 = "abcde", s2 = "ace"
  Output: 3
  // LCS: "ace"
\`\`\`
\`\`\`
Ví dụ 2:
  Input:  s1 = "abc", s2 = "abc"
  Output: 3
\`\`\`
\`\`\`
Ví dụ 3:
  Input:  s1 = "abc", s2 = "def"
  Output: 0
\`\`\`

**Ràng buộc:**
- 1 ≤ s1.length, s2.length ≤ 1000
- Yêu cầu: DP 2D — O(m*n) time`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'Dynamic Programming', role: 'General', level: 'middle',
    tags: ['dynamic programming', '2d dp', 'string', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m+1 }, () => new Array(n+1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}`,
    hints: ['Bảng DP (m+1)×(n+1)', 'Ký tự bằng: dp[i][j] = dp[i-1][j-1]+1, ngược lại: max(trên, trái)'],
  },

  // ─── Data Structures (5) ────────────────────────────────────────────────────
  {
    content: `Implement **MinStack** — stack hỗ trợ lấy phần tử nhỏ nhất trong **O(1)**.

**Yêu cầu implement:**
- \`push(val)\` — thêm phần tử
- \`pop()\` — xóa phần tử trên cùng
- \`top()\` — trả về phần tử trên cùng
- \`getMin()\` — trả về min trong O(1)

\`\`\`
Ví dụ:
  const s = new MinStack();
  s.push(-2);  s.push(0);  s.push(-3);
  s.getMin();  // Output: -3
  s.pop();
  s.top();     // Output: 0
  s.getMin();  // Output: -2
\`\`\`

**Ràng buộc:**
- -2³¹ ≤ val ≤ 2³¹ - 1
- Tất cả thao tác pop/top/getMin đều có stack không rỗng
- Tối đa 3 × 10⁴ thao tác`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Stack / Design', role: 'General', level: 'junior',
    tags: ['stack', 'design', 'data structure', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `class MinStack {
  constructor() { this._stack = []; this._minStack = []; }
  push(val) {
    this._stack.push(val);
    const min = this._minStack.length === 0
      ? val : Math.min(val, this._minStack.at(-1));
    this._minStack.push(min);
  }
  pop() { this._stack.pop(); this._minStack.pop(); }
  top() { return this._stack.at(-1); }
  getMin() { return this._minStack.at(-1); }
}`,
    hints: ['Stack phụ minStack lưu min tại mỗi level', 'minStack.top() luôn là min hiện tại'],
  },
  {
    content: `Implement **LRU Cache** với capacity cố định. Hỗ trợ \`get\` và \`put\` trong **O(1)**.

**Yêu cầu:**
- \`get(key)\` — trả về value nếu tồn tại, -1 nếu không
- \`put(key, value)\` — thêm/cập nhật. Nếu đầy, evict phần tử ít dùng nhất (Least Recently Used)

\`\`\`
Ví dụ:
  const cache = new LRUCache(2);
  cache.put(1, 1);   // cache = {1:1}
  cache.put(2, 2);   // cache = {1:1, 2:2}
  cache.get(1);      // Output: 1  → key 1 recently used
  cache.put(3, 3);   // evict key 2 (LRU), cache = {1:1, 3:3}
  cache.get(2);      // Output: -1 (không tồn tại)
  cache.put(4, 4);   // evict key 1, cache = {3:3, 4:4}
  cache.get(1);      // Output: -1
  cache.get(3);      // Output: 3
  cache.get(4);      // Output: 4
\`\`\`

**Ràng buộc:**
- 1 ≤ capacity ≤ 3000
- Tối đa 3 × 10⁴ thao tác`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'Design / Hash Map', role: 'General', level: 'senior',
    tags: ['lru cache', 'hash map', 'linked list', 'design', 'coding'],
    expectedDuration: 600,
    sampleAnswer: `class LRUCache {
  constructor(capacity) { this.cap = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.cap) {
      this.map.delete(this.map.keys().next().value);
    }
    this.map.set(key, value);
  }
}`,
    hints: ['JS Map giữ insertion order → simulate LRU', 'get: delete rồi set lại để move to most-recent'],
  },
  {
    content: `Implement **Queue dùng 2 Stack** (không dùng Array.shift).

**Yêu cầu:**
- \`enqueue(val)\` — thêm phần tử vào cuối
- \`dequeue()\` — xóa và trả về phần tử đầu
- \`peek()\` — trả về phần tử đầu (không xóa)
- \`isEmpty()\`

\`\`\`
Ví dụ:
  const q = new MyQueue();
  q.enqueue(1);  q.enqueue(2);  q.enqueue(3);
  q.peek();      // Output: 1
  q.dequeue();   // Output: 1
  q.dequeue();   // Output: 2
  q.isEmpty();   // Output: false
\`\`\`

**Ràng buộc:**
- 1 ≤ val ≤ 9
- dequeue/peek luôn gọi với queue không rỗng
- Amortized O(1) mỗi thao tác`,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'Stack / Queue / Design', role: 'General', level: 'fresher',
    tags: ['stack', 'queue', 'design', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `class MyQueue {
  constructor() { this.inbox = []; this.outbox = []; }
  enqueue(val) { this.inbox.push(val); }
  _transfer() {
    if (this.outbox.length === 0) {
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    }
  }
  dequeue() { this._transfer(); return this.outbox.pop(); }
  peek() { this._transfer(); return this.outbox.at(-1); }
  isEmpty() { return this.inbox.length === 0 && this.outbox.length === 0; }
}`,
    hints: ['inbox nhận enqueue, outbox phục vụ dequeue', 'Transfer từ inbox → outbox khi outbox rỗng'],
  },
  {
    content: `Implement **Trie (Prefix Tree)** với các thao tác:
- \`insert(word)\`
- \`search(word)\` — trả về true nếu word tồn tại
- \`startsWith(prefix)\` — trả về true nếu có word bắt đầu bằng prefix

\`\`\`
Ví dụ:
  const trie = new Trie();
  trie.insert("apple");
  trie.search("apple");    // true
  trie.search("app");      // false
  trie.startsWith("app");  // true
  trie.insert("app");
  trie.search("app");      // true
\`\`\`

**Ràng buộc:**
- 1 ≤ word.length ≤ 2000
- Chỉ gồm chữ cái thường
- Tối đa 3 × 10⁴ thao tác`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Trie / Design', role: 'General', level: 'middle',
    tags: ['trie', 'design', 'string', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `class TrieNode {
  constructor() { this.children = {}; this.isEnd = false; }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let node = this.root;
    for (const c of word) {
      if (!node.children[c]) node.children[c] = new TrieNode();
      node = node.children[c];
    }
    node.isEnd = true;
  }
  _find(str) {
    let node = this.root;
    for (const c of str) {
      if (!node.children[c]) return null;
      node = node.children[c];
    }
    return node;
  }
  search(word) { const n = this._find(word); return n !== null && n.isEnd; }
  startsWith(prefix) { return this._find(prefix) !== null; }
}`,
    hints: ['TrieNode: children map + isEnd flag', 'Helper _find traverse đến node cuối của prefix/word'],
  },
  {
    content: `Implement **Graph BFS** — tìm đường đi ngắn nhất (số cạnh) từ node \`src\` đến \`dst\` trong đồ thị vô hướng.

**Input:**
- \`n\` — số node (0 đến n-1)
- \`edges\` — mảng \`[u, v]\` (cạnh vô hướng)
- \`src\`, \`dst\` — node nguồn và đích

**Output:** số nguyên — số cạnh ngắn nhất, hoặc -1 nếu không có đường

\`\`\`
Ví dụ 1:
  n = 6
  edges = [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5]]
  src = 0, dst = 5
  Output: 3   // 0→1→3→4→5 hoặc 0→2→3→4→5
\`\`\`
\`\`\`
Ví dụ 2:
  n = 3, edges = [[0,1]], src = 0, dst = 2
  Output: -1  // không có đường đến node 2
\`\`\``,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Graph / BFS', role: 'General', level: 'middle',
    tags: ['graph', 'bfs', 'shortest path', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function shortestPath(n, edges, src, dst) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const visited = new Set([src]);
  const queue = [[src, 0]];
  while (queue.length) {
    const [node, dist] = queue.shift();
    if (node === dst) return dist;
    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return -1;
}`,
    hints: ['BFS đảm bảo tìm đường ngắn nhất (số cạnh)', 'Adjacency list + visited set'],
  },

  // ─── JavaScript Core (8) ────────────────────────────────────────────────────
  {
    content: `Implement hàm **\`debounce(fn, delay)\`** — chỉ gọi \`fn\` sau khi \`delay\` ms trôi qua kể từ lần gọi cuối.

**Input:** \`fn\` — hàm cần debounce, \`delay\` — milliseconds
**Output:** hàm debounced

\`\`\`
Ví dụ:
  const log = debounce((msg) => console.log(msg), 300);

  log("a");  // ← timer bắt đầu
  log("b");  // ← reset timer
  log("c");  // ← reset timer
  // Sau 300ms: console.log("c") được gọi 1 lần duy nhất
\`\`\`
\`\`\`
Test case:
  const results = [];
  const fn = debounce((x) => results.push(x), 100);
  fn(1); fn(2); fn(3);
  // Sau 100ms: results === [3]
\`\`\`

**Ràng buộc:**
- Giữ nguyên \`this\` context và arguments
- Mỗi lần gọi reset timer`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'JavaScript / Closure', role: 'FE', level: 'junior',
    tags: ['javascript', 'debounce', 'closure', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
    hints: ['Closure lưu timer', 'clearTimeout trước khi set timer mới'],
  },
  {
    content: `Implement hàm **\`throttle(fn, limit)\`** — đảm bảo \`fn\` chỉ được gọi tối đa **1 lần** trong mỗi \`limit\` ms.

**Input:** \`fn\` — hàm cần throttle, \`limit\` — milliseconds
**Output:** hàm throttled

\`\`\`
Ví dụ:
  const log = throttle(() => console.log("called"), 1000);

  // Gọi 5 lần trong 500ms:
  log(); log(); log(); log(); log();
  // Output: "called" chỉ 1 lần (lần gọi đầu tiên)
\`\`\`
\`\`\`
Test case:
  const results = [];
  const fn = throttle((x) => results.push(x), 100);
  fn(1); fn(2); fn(3);
  // results === [1]   ← chỉ gọi đầu tiên
\`\`\`

**Ràng buộc:**
- Lần gọi đầu tiên luôn được thực thi ngay
- Các lần gọi trong window thời gian bị bỏ qua`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'JavaScript / Closure', role: 'FE', level: 'junior',
    tags: ['javascript', 'throttle', 'closure', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}`,
    hints: ['Lưu thời điểm gọi cuối (lastCall)', 'So sánh Date.now() - lastCall với limit'],
  },
  {
    content: `Implement hàm **\`curry(fn)\`** — biến đổi hàm nhận nhiều args thành chuỗi hàm nhận từng arg.

**Input:** \`fn\` — hàm nhiều tham số
**Output:** hàm curried

\`\`\`
Ví dụ:
  const add = (a, b, c) => a + b + c;
  const curriedAdd = curry(add);

  curriedAdd(1)(2)(3);  // 6
  curriedAdd(1, 2)(3);  // 6
  curriedAdd(1)(2, 3);  // 6
  curriedAdd(1, 2, 3);  // 6
\`\`\`
\`\`\`
Ví dụ 2:
  const multiply = (x, y) => x * y;
  curry(multiply)(3)(4);  // 12
\`\`\`

**Ràng buộc:**
- Hỗ trợ cả currying từng arg và nhiều arg cùng lúc
- fn.length xác định số args cần thiết`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'JavaScript / Functional', role: 'FE', level: 'middle',
    tags: ['javascript', 'curry', 'functional', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}`,
    hints: ['So sánh args.length với fn.length', 'Đệ quy accumulate arguments cho đến đủ'],
  },
  {
    content: `Implement **\`Promise.all\`** từ đầu (không dùng Promise.all có sẵn).

**Input:** \`promises\` — mảng các Promise (hoặc giá trị)
**Output:** Promise resolve với mảng kết quả theo đúng thứ tự

\`\`\`
Ví dụ 1:
  myPromiseAll([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]).then(console.log);
  // Output: [1, 2, 3]
\`\`\`
\`\`\`
Ví dụ 2:
  myPromiseAll([
    Promise.resolve(1),
    Promise.reject("error"),
    Promise.resolve(3),
  ]).catch(console.log);
  // Output: "error"  ← reject ngay khi có 1 promise fail
\`\`\`
\`\`\`
Ví dụ 3:
  myPromiseAll([]).then(console.log);
  // Output: []
\`\`\``,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'JavaScript / Promise', role: 'FE', level: 'middle',
    tags: ['javascript', 'promise', 'async', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = [];
    let remaining = promises.length;
    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then((val) => {
          results[i] = val;
          if (--remaining === 0) resolve(results);
        })
        .catch(reject);
    });
  });
}`,
    hints: ['Counter đếm số promise đã resolve', 'Reject ngay khi có 1 promise fail'],
  },
  {
    content: `Implement hàm **\`memoize(fn)\`** — cache kết quả dựa trên arguments.

**Input:** \`fn\` — hàm thuần túy
**Output:** hàm memoized (trả cache nếu đã tính)

\`\`\`
Ví dụ:
  let callCount = 0;
  const slowSquare = memoize((n) => {
    callCount++;
    return n * n;
  });

  slowSquare(4);  // 16, callCount = 1
  slowSquare(4);  // 16, callCount = 1 (từ cache)
  slowSquare(5);  // 25, callCount = 2
  slowSquare(5);  // 25, callCount = 2 (từ cache)
\`\`\`
\`\`\`
Ví dụ 2:
  const add = memoize((a, b) => a + b);
  add(1, 2);  // 3
  add(1, 2);  // 3 (cache)
  add(2, 1);  // 3 (cache miss — args khác)
\`\`\``,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'JavaScript / Cache', role: 'FE', level: 'junior',
    tags: ['javascript', 'memoize', 'cache', 'closure', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}`,
    hints: ['Map lưu cache', 'JSON.stringify(args) làm key'],
  },
  {
    content: `Implement **\`deepClone(obj)\`** — deep clone object không dùng \`JSON.parse/stringify\`.

**Yêu cầu xử lý được:** primitives, null, Array, Object lồng nhau, Date.

\`\`\`
Ví dụ 1:
  const obj = { a: 1, b: { c: [1, 2, 3] } };
  const clone = deepClone(obj);
  clone.b.c.push(4);
  console.log(obj.b.c);    // [1, 2, 3]  ← không bị ảnh hưởng
  console.log(clone.b.c);  // [1, 2, 3, 4]
\`\`\`
\`\`\`
Ví dụ 2:
  const d = new Date("2024-01-01");
  const cloneD = deepClone(d);
  cloneD.setFullYear(2025);
  console.log(d.getFullYear());      // 2024  ← không bị thay đổi
  console.log(cloneD.getFullYear()); // 2025
\`\`\`
\`\`\`
Ví dụ 3:
  deepClone(null);   // null
  deepClone(42);     // 42
  deepClone("str");  // "str"
\`\`\``,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'JavaScript / Recursion', role: 'FE', level: 'middle',
    tags: ['javascript', 'deep clone', 'recursion', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(deepClone);
  const cloned = {};
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}`,
    hints: ['Handle null/primitives trước', 'Check instanceof Date riêng', 'Đệ quy cho nested object/array'],
  },
  {
    content: `Implement **\`EventEmitter\`** class với: \`on\`, \`off\`, \`emit\`, \`once\`.

\`\`\`
Ví dụ:
  const emitter = new EventEmitter();

  const handler = (msg) => console.log("Received:", msg);
  emitter.on("data", handler);
  emitter.emit("data", "hello");   // "Received: hello"
  emitter.emit("data", "world");   // "Received: world"
  emitter.off("data", handler);
  emitter.emit("data", "again");   // (không in gì)
\`\`\`
\`\`\`
Test once:
  emitter.once("ping", () => console.log("pong"));
  emitter.emit("ping");  // "pong"
  emitter.emit("ping");  // (không in gì — đã tự remove)
\`\`\`

**Ràng buộc:**
- \`on\` và \`once\` trả về \`this\` để chain
- \`emit\` trả về \`true\` nếu có listener, \`false\` nếu không`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'JavaScript / Design Pattern', role: 'FE', level: 'middle',
    tags: ['javascript', 'event emitter', 'design pattern', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `class EventEmitter {
  constructor() { this._events = {}; }
  on(event, listener) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(listener);
    return this;
  }
  off(event, listener) {
    if (!this._events[event]) return this;
    this._events[event] = this._events[event].filter(l => l !== listener);
    return this;
  }
  emit(event, ...args) {
    if (!this._events[event]?.length) return false;
    this._events[event].forEach(l => l(...args));
    return true;
  }
  once(event, listener) {
    const wrapper = (...args) => { listener(...args); this.off(event, wrapper); };
    return this.on(event, wrapper);
  }
}`,
    hints: ['Object/Map lưu listeners theo event', 'once: wrapper tự remove sau khi chạy'],
  },
  {
    content: `Flatten mảng lồng nhau với độ sâu tùy ý.

**Input:** \`arr\` — mảng lồng nhau, \`depth\` — độ sâu cần flatten (default: 1)
**Output:** mảng đã flatten

\`\`\`
Ví dụ 1:
  flatten([1, [2, [3, [4]]]], 1);
  // [1, 2, [3, [4]]]
\`\`\`
\`\`\`
Ví dụ 2:
  flatten([1, [2, [3, [4]]]], 2);
  // [1, 2, 3, [4]]
\`\`\`
\`\`\`
Ví dụ 3:
  flatten([1, [2, [3, [4]]]], Infinity);
  // [1, 2, 3, 4]
\`\`\`
\`\`\`
Ví dụ 4:
  flatten([1, [2, 3], [4, [5, 6]]]);
  // [1, 2, 3, 4, [5, 6]]   ← depth mặc định là 1
\`\`\``,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'JavaScript / Array', role: 'FE', level: 'junior',
    tags: ['javascript', 'array', 'flatten', 'recursion', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function flatten(arr, depth = 1) {
  if (depth === 0) return arr.slice();
  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) acc.push(...flatten(val, depth - 1));
    else acc.push(val);
    return acc;
  }, []);
}`,
    hints: ['Base case: depth === 0 return arr.slice()', 'Đệ quy giảm depth mỗi level'],
  },

  // ─── React Hooks (4) ────────────────────────────────────────────────────────
  {
    content: `Implement React hook **\`useLocalStorage(key, initialValue)\`** — đồng bộ state với localStorage.

\`\`\`
Ví dụ sử dụng:
  function Counter() {
    const [count, setCount] = useLocalStorage("count", 0);
    return (
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    );
  }
  // count vẫn được giữ sau khi F5
\`\`\`
\`\`\`
Test case:
  localStorage.setItem("name", JSON.stringify("Alice"));
  const [name, setName] = useLocalStorage("name", "Bob");
  // name === "Alice"  ← đọc từ localStorage

  setName("Charlie");
  // localStorage.getItem("name") === '"Charlie"'
\`\`\`

**Ràng buộc:**
- Serialize/deserialize bằng JSON
- Xử lý lỗi localStorage (private mode, quota)
- API giống useState: trả về [value, setValue]`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'React / Hooks', role: 'FE', level: 'junior',
    tags: ['react', 'hooks', 'localStorage', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);

  return [value, setValue];
}`,
    hints: ['Lazy init state từ localStorage', 'useEffect sync khi value thay đổi'],
  },
  {
    content: `Implement React hook **\`useFetch(url)\`** — fetch data với loading/error/data states.

\`\`\`
Ví dụ sử dụng:
  function UserList() {
    const { data, loading, error } = useFetch("/api/users");
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
  }
\`\`\`
\`\`\`
Test case:
  // Khi url thay đổi → re-fetch
  const { data } = useFetch(\`/api/users/\${userId}\`);

  // Khi component unmount → không setState (tránh memory leak)
\`\`\`

**Ràng buộc:**
- Re-fetch khi url thay đổi
- Cleanup để tránh setState trên unmounted component
- Trả về \`{ data, loading, error }\``,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'React / Hooks / Async', role: 'FE', level: 'junior',
    tags: ['react', 'hooks', 'fetch', 'async', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setData(null); setError(null);
    fetch(url)
      .then(res => res.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(err => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}`,
    hints: ['cancelled flag tránh setState sau unmount', 'Cleanup return () => cancelled = true'],
  },
  {
    content: `Implement React hook **\`useDebounce(value, delay)\`** — trả về giá trị được debounce.

\`\`\`
Ví dụ sử dụng:
  function SearchBox() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 400);

    useEffect(() => {
      if (debouncedQuery) searchAPI(debouncedQuery);
    }, [debouncedQuery]);

    return <input value={query} onChange={e => setQuery(e.target.value)} />;
  }
  // API chỉ được gọi sau 400ms người dùng ngừng gõ
\`\`\`
\`\`\`
Test case:
  const [val, setVal] = useState("a");
  const debounced = useDebounce(val, 200);
  // debounced = "a"
  setVal("b");  // chờ 200ms rồi debounced mới = "b"
\`\`\``,
    category: 'technical', type: 'coding', difficulty: 'easy',
    topic: 'React / Hooks', role: 'FE', level: 'junior',
    tags: ['react', 'hooks', 'debounce', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}`,
    hints: ['useEffect re-run khi value thay đổi', 'Cleanup clearTimeout trong return'],
  },
  {
    content: `Implement React hook **\`useInfiniteScroll(fetchMore)\`** — gọi \`fetchMore\` khi user scroll đến cuối.

\`\`\`
Ví dụ sử dụng:
  function Feed() {
    const [items, setItems] = useState([]);
    const loaderRef = useInfiniteScroll(() => {
      fetchNextPage().then(next => setItems(prev => [...prev, ...next]));
    });
    return (
      <div>
        {items.map(i => <Card key={i.id} {...i} />)}
        <div ref={loaderRef} style={{ height: 1 }} />
      </div>
    );
  }
\`\`\`

**Ràng buộc:**
- Dùng **IntersectionObserver** (không dùng scroll event)
- Hook trả về \`ref\` để attach vào sentinel element
- Cleanup observer khi component unmount`,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'React / IntersectionObserver', role: 'FE', level: 'middle',
    tags: ['react', 'intersection observer', 'infinite scroll', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `import { useRef, useEffect, useCallback } from 'react';

function useInfiniteScroll(fetchMore) {
  const loaderRef = useRef(null);
  const handleObserver = useCallback((entries) => {
    if (entries[0].isIntersecting) fetchMore();
  }, [fetchMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null, threshold: 0.1,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return loaderRef;
}`,
    hints: ['IntersectionObserver trigger khi sentinel element visible', 'observer.disconnect() khi cleanup'],
  },

  // ─── Backend / Node.js (4) ──────────────────────────────────────────────────
  {
    content: `Implement Express middleware **\`rateLimit({ windowMs, max })\`** — giới hạn số request mỗi IP trong window thời gian.

\`\`\`
Ví dụ sử dụng:
  app.use(rateLimit({ windowMs: 60_000, max: 100 }));
  // Mỗi IP tối đa 100 request / phút
  // Vượt quá → 429 Too Many Requests
\`\`\`
\`\`\`
Test case:
  // IP "1.2.3.4" gửi 101 request trong 1 phút:
  // Request 1-100: 200 OK
  // Request 101:   429 { message: "Too many requests" }
\`\`\`
\`\`\`
Test case:
  // Sau khi window hết hạn (60s):
  // Request tiếp theo từ IP đó: 200 OK (đã reset)
\`\`\`

**Ràng buộc:**
- In-memory store (không cần Redis)
- Reset counter khi window hết hạn`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'Node.js / Express', role: 'BE', level: 'middle',
    tags: ['node.js', 'express', 'rate limit', 'middleware', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `function rateLimit({ windowMs, max }) {
  const store = new Map(); // ip → { count, resetTime }
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const record = store.get(ip);
    if (!record || record.resetTime < now) {
      store.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    if (record.count >= max) {
      return res.status(429).json({ message: 'Too many requests' });
    }
    record.count++;
    next();
  };
}`,
    hints: ['Map: ip → {count, resetTime}', 'Reset khi resetTime < Date.now()', '429 khi count >= max'],
  },
  {
    content: `Implement hàm **\`retry(fn, retries, delay)\`** — thử lại async function khi thất bại với **exponential backoff**.

**Input:** \`fn\` — async function, \`retries\` — số lần thử tối đa, \`delay\` — ms delay ban đầu
**Output:** Promise

\`\`\`
Ví dụ 1:
  const result = await retry(
    () => fetch("https://api.example.com/data"),
    3,    // max 3 lần retry
    1000  // delay ban đầu 1s, lần sau 2s, 4s (exponential)
  );
\`\`\`
\`\`\`
Ví dụ 2 — sequence khi fail 2 lần rồi thành công:
  Lần 1: fail → chờ 1000ms
  Lần 2: fail → chờ 2000ms
  Lần 3: success → resolve result
\`\`\`
\`\`\`
Ví dụ 3 — fail hết retries:
  retry(() => Promise.reject("err"), 2, 100)
    .catch(e => console.log(e)); // "err"
\`\`\``,
    category: 'technical', type: 'coding', difficulty: 'medium',
    topic: 'Node.js / Async', role: 'BE', level: 'junior',
    tags: ['node.js', 'async', 'retry', 'exponential backoff', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}`,
    hints: ['Đệ quy: retry(fn, retries-1, delay*2)', 'throw err khi retries === 0'],
  },
  {
    content: `Implement **\`pipe(...middlewares)\`** — kết hợp nhiều Express middleware thành 1 middleware duy nhất.

\`\`\`
Ví dụ sử dụng:
  const combined = pipe(
    cors(),
    helmet(),
    rateLimit({ max: 100 }),
    authMiddleware,
  );
  app.use("/api", combined);
\`\`\`
\`\`\`
Test case — thực thi tuần tự:
  const log = (name) => (req, res, next) => {
    console.log(name); next();
  };
  const m = pipe(log("A"), log("B"), log("C"));
  // Gọi m(req, res, next) → in: A, B, C, sau đó gọi next()
\`\`\`
\`\`\`
Test case — middleware throw error:
  // Nếu middleware bên trong throw → gọi next(err)
\`\`\``,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'Node.js / Express', role: 'BE', level: 'middle',
    tags: ['node.js', 'express', 'middleware', 'compose', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function pipe(...middlewares) {
  return (req, res, next) => {
    function dispatch(i) {
      if (i >= middlewares.length) return next();
      try {
        middlewares[i](req, res, () => dispatch(i + 1));
      } catch (err) {
        next(err);
      }
    }
    dispatch(0);
  };
}`,
    hints: ['Mỗi middleware gọi next() để sang tiếp theo', 'dispatch(i+1) trong next callback'],
  },
  {
    content: `Implement **\`asyncPool(poolLimit, tasks)\`** — thực thi danh sách async tasks với **giới hạn concurrency**.

**Input:** \`poolLimit\` — số task chạy đồng thời tối đa, \`tasks\` — mảng async functions
**Output:** Promise resolve với mảng kết quả theo thứ tự

\`\`\`
Ví dụ:
  const delay = (ms, val) => new Promise(r => setTimeout(() => r(val), ms));
  const tasks = [
    () => delay(300, "A"),
    () => delay(100, "B"),
    () => delay(200, "C"),
    () => delay(50,  "D"),
  ];

  const results = await asyncPool(2, tasks);
  // Output: ["A", "B", "C", "D"]  ← thứ tự theo task index

  // Timeline với poolLimit=2:
  // t=0:   A, B bắt đầu
  // t=100: B xong → C bắt đầu
  // t=200: C xong → D bắt đầu
  // t=300: A xong
  // t=250: D xong
\`\`\`

**Ràng buộc:**
- Không quá \`poolLimit\` task chạy đồng thời
- Kết quả theo đúng thứ tự input (không phải thứ tự hoàn thành)`,
    category: 'technical', type: 'coding', difficulty: 'hard',
    topic: 'Node.js / Concurrency', role: 'BE', level: 'senior',
    tags: ['node.js', 'async', 'concurrency', 'promise pool', 'coding'],
    expectedDuration: 540,
    sampleAnswer: `async function asyncPool(poolLimit, tasks) {
  const results = [];
  const executing = new Set();
  for (let i = 0; i < tasks.length; i++) {
    const p = tasks[i]().then(val => { results[i] = val; executing.delete(p); });
    executing.add(p);
    if (executing.size >= poolLimit) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}`,
    hints: ['Set theo dõi executing promises', 'Promise.race để chờ 1 task xong khi đầy pool'],
  },
];

const seedCodingQuestions = async () => {
  try {
    const deleted = await Question.deleteMany({ type: 'coding' });
    console.log(`[Seeder] Deleted ${deleted.deletedCount} old coding questions`);
    await Question.insertMany(codingQuestions);
    console.log(`[Seeder] Seeded ${codingQuestions.length} coding questions successfully.`);
  } catch (err) {
    console.error('[Seeder] Failed to seed coding questions:', err.message);
  }
};

module.exports = seedCodingQuestions;
