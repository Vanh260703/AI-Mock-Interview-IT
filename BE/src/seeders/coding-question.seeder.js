const Question = require('../models/question.model');

const codingQuestions = [
  // ─── JavaScript Core (12) ────────────────────────────────────────────────────
  {
    content: `Viết hàm \`debounce(fn, delay)\` trong JavaScript.
Hàm debounce chỉ gọi \`fn\` sau khi \`delay\` ms trôi qua kể từ lần gọi cuối cùng.

Ví dụ:
\`\`\`js
const log = debounce(() => console.log('called'), 300);
log(); log(); log();
// Chỉ in ra 'called' 1 lần sau 300ms
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'JavaScript',
    role: 'FE',
    level: 'junior',
    tags: ['javascript', 'debounce', 'closure', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`,
    hints: ['Dùng closure để lưu timer', 'clearTimeout trước khi set timer mới'],
  },
  {
    content: `Viết hàm \`throttle(fn, limit)\` trong JavaScript.
Hàm throttle đảm bảo \`fn\` chỉ được gọi tối đa 1 lần trong mỗi khoảng \`limit\` ms.

Ví dụ:
\`\`\`js
const log = throttle(() => console.log('called'), 1000);
// Gọi 10 lần trong 1 giây → chỉ in 1 lần
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'JavaScript',
    role: 'FE',
    level: 'junior',
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
    hints: ['Lưu thời điểm gọi cuối cùng', 'So sánh Date.now() với lastCall'],
  },
  {
    content: `Implement hàm \`curry(fn)\` — biến đổi một hàm nhận nhiều arguments thành chuỗi hàm nhận từng argument.

Ví dụ:
\`\`\`js
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
curriedAdd(1)(2)(3); // 6
curriedAdd(1, 2)(3); // 6
curriedAdd(1)(2, 3); // 6
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'JavaScript',
    role: 'FE',
    level: 'middle',
    tags: ['javascript', 'curry', 'functional', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}`,
    hints: ['So sánh số lượng args với fn.length', 'Dùng đệ quy để accumulate arguments'],
  },
  {
    content: `Implement hàm \`memoize(fn)\` — cache kết quả của hàm dựa trên arguments.

Ví dụ:
\`\`\`js
const slowSquare = memoize((n) => {
  // giả sử tính toán nặng
  return n * n;
});
slowSquare(4); // tính toán, trả về 16
slowSquare(4); // lấy từ cache, trả về 16
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'JavaScript',
    role: 'FE',
    level: 'junior',
    tags: ['javascript', 'memoize', 'cache', 'coding'],
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
    hints: ['Dùng Map để lưu cache', 'JSON.stringify args làm key'],
  },
  {
    content: `Implement \`Promise.all(promises)\` từ đầu (không dùng Promise.all có sẵn).

Ví dụ:
\`\`\`js
myPromiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(console.log); // [1, 2, 3]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'JavaScript',
    role: 'FE',
    level: 'middle',
    tags: ['javascript', 'promise', 'async', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = [];
    let remaining = promises.length;
    promises.forEach((p, i) => {
      Promise.resolve(p).then((val) => {
        results[i] = val;
        remaining--;
        if (remaining === 0) resolve(results);
      }).catch(reject);
    });
  });
}`,
    hints: ['Dùng counter để track số promise đã resolve', 'Reject ngay khi có 1 promise fail'],
  },
  {
    content: `Implement \`Array.prototype.map\` từ đầu (không dùng .map có sẵn).

\`\`\`js
Array.prototype.myMap = function(callback) {
  // ... your code
};
[1, 2, 3].myMap(x => x * 2); // [2, 4, 6]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'JavaScript',
    role: 'FE',
    level: 'fresher',
    tags: ['javascript', 'array', 'prototype', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `Array.prototype.myMap = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result.push(callback(this[i], i, this));
    }
  }
  return result;
};`,
    hints: ['Dùng for loop thay vì map', 'Nhớ pass (element, index, array) vào callback'],
  },
  {
    content: `Implement \`Array.prototype.reduce\` từ đầu.

\`\`\`js
Array.prototype.myReduce = function(callback, initialValue) {
  // ... your code
};
[1, 2, 3, 4].myReduce((acc, cur) => acc + cur, 0); // 10
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'JavaScript',
    role: 'FE',
    level: 'junior',
    tags: ['javascript', 'array', 'reduce', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `Array.prototype.myReduce = function(callback, initialValue) {
  let acc = initialValue !== undefined ? initialValue : this[0];
  let startIndex = initialValue !== undefined ? 0 : 1;
  for (let i = startIndex; i < this.length; i++) {
    if (i in this) {
      acc = callback(acc, this[i], i, this);
    }
  }
  return acc;
};`,
    hints: ['Xử lý trường hợp không có initialValue', 'acc bắt đầu từ this[0] nếu không có initialValue'],
  },
  {
    content: `Viết hàm \`deepClone(obj)\` để deep clone một object (không dùng JSON.parse/JSON.stringify).

Yêu cầu: handle được Date, Array, Object lồng nhau, null, primitive types.

\`\`\`js
const obj = { a: 1, b: { c: [1, 2, 3] }, d: new Date() };
const clone = deepClone(obj);
clone.b.c.push(4);
obj.b.c; // vẫn là [1, 2, 3]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'JavaScript',
    role: 'FE',
    level: 'middle',
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
    hints: ['Handle null/primitives trước', 'Check instanceof Date riêng', 'Dùng đệ quy cho nested objects'],
  },
  {
    content: `Implement một \`EventEmitter\` class với các method: \`on(event, listener)\`, \`off(event, listener)\`, \`emit(event, ...args)\`, \`once(event, listener)\`.

\`\`\`js
const emitter = new EventEmitter();
emitter.on('data', (msg) => console.log(msg));
emitter.emit('data', 'hello'); // 'hello'
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'JavaScript',
    role: 'FE',
    level: 'middle',
    tags: ['javascript', 'event emitter', 'design pattern', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `class EventEmitter {
  constructor() {
    this._events = {};
  }
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
    if (!this._events[event]) return false;
    this._events[event].forEach(l => l(...args));
    return true;
  }
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}`,
    hints: ['Dùng Map/Object để lưu listeners', 'once: dùng wrapper function tự remove sau khi gọi'],
  },
  {
    content: `Flatten một mảng lồng nhau với độ sâu tùy ý (implement \`flatten(arr, depth)\`).

\`\`\`js
flatten([1, [2, [3, [4]]]], 1);   // [1, 2, [3, [4]]]
flatten([1, [2, [3, [4]]]], 2);   // [1, 2, 3, [4]]
flatten([1, [2, [3, [4]]]], Infinity); // [1, 2, 3, 4]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'JavaScript',
    role: 'FE',
    level: 'junior',
    tags: ['javascript', 'array', 'flatten', 'recursion', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function flatten(arr, depth = 1) {
  if (depth === 0) return arr.slice();
  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flatten(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
}`,
    hints: ['Base case: depth === 0 return arr', 'Đệ quy giảm depth mỗi lần'],
  },
  {
    content: `Implement \`pipe(...fns)\` — nhận nhiều function, trả về function thực hiện chúng tuần tự (output của fn này là input của fn tiếp theo).

\`\`\`js
const double = x => x * 2;
const addOne = x => x + 1;
const square = x => x * x;
const transform = pipe(double, addOne, square);
transform(3); // ((3*2)+1)^2 = 49
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'JavaScript',
    role: 'FE',
    level: 'junior',
    tags: ['javascript', 'pipe', 'functional', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `const pipe = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);

// Hoặc:
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}`,
    hints: ['Dùng reduce để chain functions', 'Input đầu tiên là value, sau đó dùng output của fn trước'],
  },
  {
    content: `Implement \`getNestedValue(obj, path)\` — lấy giá trị từ nested object theo đường dẫn chuỗi.

\`\`\`js
const obj = { a: { b: { c: 42 } } };
getNestedValue(obj, 'a.b.c');  // 42
getNestedValue(obj, 'a.x.y');  // undefined
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'JavaScript',
    role: 'FE',
    level: 'fresher',
    tags: ['javascript', 'object', 'path', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current !== undefined && current !== null
      ? current[key]
      : undefined;
  }, obj);
}`,
    hints: ['Split path bằng dấu chấm', 'Dùng reduce để traverse từng level'],
  },

  // ─── Array / String Algorithms (15) ─────────────────────────────────────────
  {
    content: `Cho một mảng số nguyên \`nums\` và target \`k\`, tìm 2 chỉ số \`[i, j]\` sao cho \`nums[i] + nums[j] === k\`.

\`\`\`js
twoSum([2, 7, 11, 15], 9);  // [0, 1]
twoSum([3, 2, 4], 6);       // [1, 2]
\`\`\`

Yêu cầu: time complexity O(n).`,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'Algorithm',
    role: 'General',
    level: 'intern',
    tags: ['array', 'hash map', 'algorithm', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function twoSum(nums, k) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = k - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}`,
    hints: ['Dùng HashMap để tra cứu complement trong O(1)', 'Lưu value → index vào Map'],
  },
  {
    content: `Tìm độ dài của chuỗi con không có ký tự lặp lại dài nhất.

\`\`\`js
lengthOfLongestSubstring("abcabcbb"); // 3 ("abc")
lengthOfLongestSubstring("bbbbb");    // 1 ("b")
lengthOfLongestSubstring("pwwkew");   // 3 ("wke")
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Algorithm',
    role: 'General',
    level: 'junior',
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
    hints: ['Sliding window với left/right pointer', 'Map lưu index của ký tự gần nhất'],
  },
  {
    content: `Kiểm tra chuỗi có phải palindrome không (bỏ qua ký tự không phải chữ/số, không phân biệt hoa thường).

\`\`\`js
isPalindrome("A man, a plan, a canal: Panama"); // true
isPalindrome("race a car");                      // false
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'String',
    role: 'General',
    level: 'intern',
    tags: ['string', 'two pointers', 'palindrome', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}`,
    hints: ['Làm sạch chuỗi trước với regex', 'Two pointer từ hai đầu'],
  },
  {
    content: `Tìm tổng lớn nhất của một mảng con liên tiếp (Maximum Subarray — Kadane's Algorithm).

\`\`\`js
maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]); // 6 (subarray [4,-1,2,1])
maxSubArray([1]);     // 1
maxSubArray([-1,-2]); // -1
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Algorithm',
    role: 'General',
    level: 'junior',
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
    hints: ['Tại mỗi vị trí: chọn bắt đầu lại hay tiếp tục?', 'current = max(nums[i], current + nums[i])'],
  },
  {
    content: `Cho mảng các khoảng thời gian \`[[start, end],...]\`, merge các khoảng chồng lấp nhau.

\`\`\`js
merge([[1,3],[2,6],[8,10],[15,18]]); // [[1,6],[8,10],[15,18]]
merge([[1,4],[4,5]]);               // [[1,5]]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Algorithm',
    role: 'General',
    level: 'junior',
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
    hints: ['Sort theo start time trước', 'So sánh start của interval hiện tại với end của interval trước'],
  },
  {
    content: `Tìm phần tử xuất hiện nhiều hơn n/2 lần trong mảng (majority element). Yêu cầu O(n) time, O(1) space.

\`\`\`js
majorityElement([3, 2, 3]);                // 3
majorityElement([2, 2, 1, 1, 1, 2, 2]);   // 2
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Algorithm',
    role: 'General',
    level: 'junior',
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
    hints: ['Boyer-Moore Voting Algorithm', 'count bị triệt tiêu → đổi candidate'],
  },
  {
    content: `Xoay mảng sang phải \`k\` bước mà không dùng mảng phụ.

\`\`\`js
rotate([1,2,3,4,5,6,7], 3); // [5,6,7,1,2,3,4]
rotate([-1,-100,3,99], 2);  // [3,99,-1,-100]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Array',
    role: 'General',
    level: 'junior',
    tags: ['array', 'in-place', 'reverse', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function rotate(nums, k) {
  k = k % nums.length;
  const rev = (l, r) => {
    while (l < r) {
      [nums[l], nums[r]] = [nums[r], nums[l]];
      l++; r--;
    }
  };
  rev(0, nums.length - 1);
  rev(0, k - 1);
  rev(k, nums.length - 1);
}`,
    hints: ['Reverse toàn bộ → reverse [0..k-1] → reverse [k..n-1]', 'k = k % n để tránh k > n'],
  },
  {
    content: `Tìm tích của tất cả phần tử trong mảng ngoại trừ phần tử hiện tại. Không dùng phép chia. O(n) time, O(1) extra space.

\`\`\`js
productExceptSelf([1,2,3,4]); // [24,12,8,6]
productExceptSelf([-1,1,0,-3,3]); // [0,0,9,0,0]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Array',
    role: 'General',
    level: 'middle',
    tags: ['array', 'prefix product', 'algorithm', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n).fill(1);
  // prefix products
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    result[i] = prefix;
    prefix *= nums[i];
  }
  // suffix products
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  return result;
}`,
    hints: ['Pass 1: tích prefix (trái)', 'Pass 2: nhân thêm suffix (phải)'],
  },
  {
    content: `Cho chuỗi gồm các ký tự '(', ')', '{', '}', '[', ']', kiểm tra xem chuỗi có hợp lệ không.

\`\`\`js
isValid("()");      // true
isValid("()[]{}"); // true
isValid("(]");     // false
isValid("([)]");   // false
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'Stack',
    role: 'General',
    level: 'intern',
    tags: ['stack', 'string', 'parentheses', 'coding'],
    expectedDuration: 240,
    sampleAnswer: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if ('({['.includes(c)) {
      stack.push(c);
    } else {
      if (stack.pop() !== map[c]) return false;
    }
  }
  return stack.length === 0;
}`,
    hints: ['Stack: push khi gặp mở, pop khi gặp đóng', 'Dùng map để tra closing → opening bracket'],
  },
  {
    content: `Tìm container chứa nhiều nước nhất (Container With Most Water).

Cho mảng \`height[]\` biểu diễn chiều cao các cột, tìm 2 cột tạo ra bể chứa nhiều nước nhất.

\`\`\`js
maxArea([1,8,6,2,5,4,8,3,7]); // 49
maxArea([1,1]);                // 1
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Two Pointers',
    role: 'General',
    level: 'junior',
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
    content: `Cho mảng số nguyên chưa sắp xếp, tìm độ dài của chuỗi số liên tiếp dài nhất. Yêu cầu O(n).

\`\`\`js
longestConsecutive([100,4,200,1,3,2]); // 4 (1,2,3,4)
longestConsecutive([0,3,7,2,5,8,4,6,0,1]); // 9
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Hash Set',
    role: 'General',
    level: 'middle',
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
    hints: ['Dùng Set để tra cứu O(1)', 'Chỉ bắt đầu đếm khi num-1 không tồn tại trong set'],
  },
  {
    content: `Implement hàm \`groupAnagrams(strs)\` — gom nhóm các anagram lại với nhau.

\`\`\`js
groupAnagrams(["eat","tea","tan","ate","nat","bat"]);
// [["eat","tea","ate"],["tan","nat"],["bat"]]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Hash Map',
    role: 'General',
    level: 'junior',
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
    hints: ['Sort từng string làm key', 'Dùng Map: sorted_string → [strings]'],
  },
  {
    content: `Tìm ký tự đầu tiên không lặp lại trong chuỗi. Trả về index, hoặc -1 nếu không có.

\`\`\`js
firstUniqChar("leetcode"); // 0 ('l')
firstUniqChar("loveleetcode"); // 2 ('v')
firstUniqChar("aabb"); // -1
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'String',
    role: 'General',
    level: 'intern',
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
    hints: ['Pass 1: đếm tần suất mỗi ký tự', 'Pass 2: tìm ký tự đầu tiên có count = 1'],
  },
  {
    content: `Cho mảng các string, trả về tất cả các hoán vị (permutations) của một string.

\`\`\`js
permutations("abc");
// ["abc","acb","bac","bca","cab","cba"]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'Backtracking',
    role: 'General',
    level: 'middle',
    tags: ['backtracking', 'recursion', 'string', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `function permutations(s) {
  const result = [];
  const used = new Array(s.length).fill(false);
  const backtrack = (current) => {
    if (current.length === s.length) {
      result.push(current);
      return;
    }
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
    hints: ['Dùng backtracking với mảng used[]', 'Base case: current.length === s.length'],
  },
  {
    content: `Implement Binary Search. Tìm index của target trong mảng đã sắp xếp. Trả về -1 nếu không tìm thấy.

\`\`\`js
binarySearch([1,3,5,7,9,11], 7);  // 3
binarySearch([1,3,5,7,9,11], 6);  // -1
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'Searching',
    role: 'General',
    level: 'intern',
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
    hints: ['mid = left + (right - left) / 2 để tránh overflow', 'Điều kiện dừng: left > right'],
  },

  // ─── Data Structures (10) ───────────────────────────────────────────────────
  {
    content: `Implement Stack class với các method: \`push(val)\`, \`pop()\`, \`peek()\`, \`isEmpty()\`, \`size()\`.

\`\`\`js
const s = new Stack();
s.push(1); s.push(2); s.push(3);
s.peek();  // 3
s.pop();   // 3
s.size();  // 2
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'Data Structure',
    role: 'General',
    level: 'intern',
    tags: ['stack', 'data structure', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `class Stack {
  constructor() { this._data = []; }
  push(val) { this._data.push(val); }
  pop() { return this._data.pop(); }
  peek() { return this._data[this._data.length - 1]; }
  isEmpty() { return this._data.length === 0; }
  size() { return this._data.length; }
}`,
    hints: ['Dùng array làm backing store', 'LIFO: push/pop từ cuối mảng'],
  },
  {
    content: `Implement Queue class với các method: \`enqueue(val)\`, \`dequeue()\`, \`front()\`, \`isEmpty()\`, \`size()\`.

Yêu cầu: \`dequeue()\` phải O(1) (không dùng array.shift).

\`\`\`js
const q = new Queue();
q.enqueue(1); q.enqueue(2);
q.dequeue(); // 1
q.front();   // 2
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Data Structure',
    role: 'General',
    level: 'junior',
    tags: ['queue', 'data structure', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `class Queue {
  constructor() {
    this._data = {};
    this._head = 0;
    this._tail = 0;
  }
  enqueue(val) { this._data[this._tail++] = val; }
  dequeue() {
    if (this.isEmpty()) return undefined;
    const val = this._data[this._head];
    delete this._data[this._head++];
    return val;
  }
  front() { return this._data[this._head]; }
  isEmpty() { return this._head === this._tail; }
  size() { return this._tail - this._head; }
}`,
    hints: ['Dùng object + head/tail pointer thay vì array để dequeue O(1)', 'head++ khi dequeue, tail++ khi enqueue'],
  },
  {
    content: `Implement Singly Linked List với các method: \`append(val)\`, \`prepend(val)\`, \`delete(val)\`, \`toArray()\`.

\`\`\`js
const list = new LinkedList();
list.append(1); list.append(2); list.append(3);
list.prepend(0);
list.delete(2);
list.toArray(); // [0, 1, 3]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Data Structure',
    role: 'General',
    level: 'junior',
    tags: ['linked list', 'data structure', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `class Node {
  constructor(val) { this.val = val; this.next = null; }
}
class LinkedList {
  constructor() { this.head = null; }
  append(val) {
    const node = new Node(val);
    if (!this.head) { this.head = node; return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = node;
  }
  prepend(val) {
    const node = new Node(val);
    node.next = this.head;
    this.head = node;
  }
  delete(val) {
    if (!this.head) return;
    if (this.head.val === val) { this.head = this.head.next; return; }
    let cur = this.head;
    while (cur.next && cur.next.val !== val) cur = cur.next;
    if (cur.next) cur.next = cur.next.next;
  }
  toArray() {
    const arr = [];
    let cur = this.head;
    while (cur) { arr.push(cur.val); cur = cur.next; }
    return arr;
  }
}`,
    hints: ['Luôn xử lý edge case: head là null, node cần xóa là head'],
  },
  {
    content: `Đảo ngược một Linked List.

\`\`\`
Input:  1 → 2 → 3 → 4 → 5 → null
Output: 5 → 4 → 3 → 2 → 1 → null
\`\`\`

\`\`\`js
reverseList(head); // trả về head mới
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'Linked List',
    role: 'General',
    level: 'fresher',
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
    hints: ['Ba pointer: prev, cur, next', 'Đặt cur.next = prev, sau đó advance cả hai'],
  },
  {
    content: `Phát hiện cycle trong Linked List (Floyd's algorithm).

\`\`\`js
hasCycle(head); // true nếu có vòng lặp, false nếu không
\`\`\`

Yêu cầu: O(1) space.`,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Linked List',
    role: 'General',
    level: 'junior',
    tags: ['linked list', 'two pointers', 'cycle', 'coding'],
    expectedDuration: 300,
    sampleAnswer: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    hints: ["Floyd's Tortoise & Hare", 'slow đi 1 bước, fast đi 2 bước — nếu gặp nhau thì có cycle'],
  },
  {
    content: `Implement \`MinStack\` — stack hỗ trợ lấy min trong O(1).

\`\`\`js
const s = new MinStack();
s.push(-2); s.push(0); s.push(-3);
s.getMin(); // -3
s.pop();
s.top();    // 0
s.getMin(); // -2
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Stack',
    role: 'General',
    level: 'junior',
    tags: ['stack', 'design', 'data structure', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `class MinStack {
  constructor() {
    this._stack = [];
    this._minStack = [];
  }
  push(val) {
    this._stack.push(val);
    const min = this._minStack.length === 0
      ? val
      : Math.min(val, this._minStack[this._minStack.length - 1]);
    this._minStack.push(min);
  }
  pop() {
    this._stack.pop();
    this._minStack.pop();
  }
  top() { return this._stack[this._stack.length - 1]; }
  getMin() { return this._minStack[this._minStack.length - 1]; }
}`,
    hints: ['Dùng stack phụ lưu min tại mỗi level', 'minStack.top() luôn là min của toàn stack'],
  },
  {
    content: `Implement \`LRU Cache\` với capacity cố định. Hỗ trợ \`get(key)\` và \`put(key, value)\` trong O(1).

\`\`\`js
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
cache.get(1);    // 1 (key 1 recently used)
cache.put(3, 3); // evicts key 2
cache.get(2);    // -1 (not found)
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'Data Structure',
    role: 'General',
    level: 'senior',
    tags: ['lru cache', 'hash map', 'linked list', 'design', 'coding'],
    expectedDuration: 600,
    sampleAnswer: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val); // move to end (most recent)
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) {
      this.map.delete(this.map.keys().next().value); // evict oldest
    }
    this.map.set(key, value);
  }
}`,
    hints: ['JavaScript Map giữ insertion order → dùng để simulate LRU', 'get: delete rồi set lại để move to end'],
  },
  {
    content: `Tính chiều cao (height) của Binary Tree.

\`\`\`js
//     3
//    / \\
//   9  20
//      / \\
//     15   7
maxDepth(root); // 3
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'Tree',
    role: 'General',
    level: 'junior',
    tags: ['tree', 'recursion', 'dfs', 'coding'],
    expectedDuration: 180,
    sampleAnswer: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
    hints: ['Base case: root === null → 0', 'Height = 1 + max(left, right)'],
  },
  {
    content: `Level-order traversal của Binary Tree (BFS). Trả về mảng 2 chiều theo từng level.

\`\`\`js
//     3
//    / \\
//   9  20
//      / \\
//     15   7
levelOrder(root); // [[3],[9,20],[15,7]]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Tree',
    role: 'General',
    level: 'junior',
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
    hints: ['Dùng Queue (BFS)', 'Xử lý từng level theo size của queue tại thời điểm đó'],
  },
  {
    content: `Validate Binary Search Tree — kiểm tra xem cây có phải BST hợp lệ không.

\`\`\`js
//   2         5
//  / \\       / \\
// 1   3     1   4
//          / \\
//         3   6
isValidBST(root1); // true
isValidBST(root2); // false
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Tree',
    role: 'General',
    level: 'middle',
    tags: ['tree', 'bst', 'recursion', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val)
      && isValidBST(root.right, root.val, max);
}`,
    hints: ['Pass min/max bounds xuống đệ quy', 'Left subtree: max = root.val, Right subtree: min = root.val'],
  },

  // ─── Sorting (5) ────────────────────────────────────────────────────────────
  {
    content: `Implement Merge Sort.

\`\`\`js
mergeSort([5, 3, 8, 1, 2]); // [1, 2, 3, 5, 8]
\`\`\`

Yêu cầu: O(n log n) time.`,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Sorting',
    role: 'General',
    level: 'junior',
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
    hints: ['Chia đôi → sắp xếp từng nửa → merge', 'merge: two-pointer compare từng phần tử'],
  },
  {
    content: `Implement Quick Sort.

\`\`\`js
quickSort([3, 6, 8, 10, 1, 2, 1]); // [1, 1, 2, 3, 6, 8, 10]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Sorting',
    role: 'General',
    level: 'junior',
    tags: ['sorting', 'divide and conquer', 'recursion', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left  = arr.filter(x => x < pivot);
  const mid   = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...mid, ...quickSort(right)];
}`,
    hints: ['Chọn pivot, chia thành 3 phần: < pivot, = pivot, > pivot', 'Đệ quy sắp xếp left và right'],
  },
  {
    content: `Implement Quick Sort in-place (không tạo mảng mới).

\`\`\`js
function quickSortInPlace(arr, low = 0, high = arr.length - 1) {
  // ...
}
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'Sorting',
    role: 'General',
    level: 'middle',
    tags: ['sorting', 'in-place', 'partition', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `function quickSortInPlace(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSortInPlace(arr, low, pi - 1);
    quickSortInPlace(arr, pi + 1, high);
  }
  return arr;
}
function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    hints: ['Lomuto partition: dùng pivot = arr[high]', 'i track vị trí phần tử nhỏ hơn pivot'],
  },

  // ─── Dynamic Programming (5) ────────────────────────────────────────────────
  {
    content: `Climbing Stairs: Có \`n\` bậc thang, mỗi lần leo được 1 hoặc 2 bậc. Tính số cách để lên đến bậc \`n\`.

\`\`\`js
climbStairs(2); // 2 (1+1, 2)
climbStairs(3); // 3 (1+1+1, 1+2, 2+1)
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'Dynamic Programming',
    role: 'General',
    level: 'intern',
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
    hints: ['f(n) = f(n-1) + f(n-2) (giống Fibonacci)', 'Dùng 2 biến thay vì mảng để O(1) space'],
  },
  {
    content: `Coin Change: Cho mảng mệnh giá \`coins\` và số tiền \`amount\`, tìm số đồng xu ít nhất để đạt \`amount\`. Trả về -1 nếu không thể.

\`\`\`js
coinChange([1,5,11], 15); // 3 (5+5+5)
coinChange([2], 3);       // -1
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Dynamic Programming',
    role: 'General',
    level: 'middle',
    tags: ['dynamic programming', 'bfs', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    hints: ['dp[i] = min coins để đạt amount i', 'dp[i] = min(dp[i - coin] + 1) for each coin'],
  },
  {
    content: `Longest Common Subsequence (LCS): Tìm độ dài chuỗi con chung dài nhất của 2 chuỗi.

\`\`\`js
lcs("abcde", "ace"); // 3 ("ace")
lcs("abc", "abc");   // 3
lcs("abc", "def");   // 0
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'Dynamic Programming',
    role: 'General',
    level: 'middle',
    tags: ['dynamic programming', '2d dp', 'string', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `function lcs(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}`,
    hints: ['Bảng DP 2D m×n', 'Nếu ký tự bằng nhau: dp[i][j] = dp[i-1][j-1] + 1, ngược lại: max(trái, trên)'],
  },
  {
    content: `0/1 Knapsack: Có \`n\` item, mỗi item có weight và value. Với sức chứa W, tìm tổng value lớn nhất.

\`\`\`js
knapsack([2,3,4,5], [3,4,5,6], 5); // 7 (item 0+1: weight 5, value 7)
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'Dynamic Programming',
    role: 'General',
    level: 'senior',
    tags: ['dynamic programming', 'knapsack', 'coding'],
    expectedDuration: 600,
    sampleAnswer: `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i - 1][w]; // không lấy item i
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      }
    }
  }
  return dp[n][W];
}`,
    hints: ['dp[i][w] = max value với i items và capacity w', 'Với mỗi item: lấy hoặc không lấy'],
  },
  {
    content: `Word Break: Cho chuỗi \`s\` và dictionary \`wordDict\`, kiểm tra xem \`s\` có thể phân tách thành các từ trong dict không.

\`\`\`js
wordBreak("leetcode", ["leet","code"]);       // true
wordBreak("applepenapple", ["apple","pen"]);  // true
wordBreak("catsandog", ["cats","dog","sand"]); // false
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'Dynamic Programming',
    role: 'General',
    level: 'senior',
    tags: ['dynamic programming', 'string', 'coding'],
    expectedDuration: 540,
    sampleAnswer: `function wordBreak(s, wordDict) {
  const set = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && set.has(s.slice(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}`,
    hints: ['dp[i] = true nếu s[0..i] có thể phân tách', 'Thử tất cả điểm cắt j: dp[j] && s[j..i] trong dict'],
  },

  // ─── Frontend Specific (5) ──────────────────────────────────────────────────
  {
    content: `Implement React hook \`useLocalStorage(key, initialValue)\` — sync state với localStorage.

\`\`\`js
function Counter() {
  const [count, setCount] = useLocalStorage('count', 0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
// State vẫn giữ sau khi refresh trang
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'React',
    role: 'FE',
    level: 'junior',
    tags: ['react', 'hooks', 'localStorage', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}`,
    hints: ['Lazy init state từ localStorage', 'useEffect để sync khi value thay đổi'],
  },
  {
    content: `Implement React hook \`useFetch(url)\` — fetch data với loading, error, data state.

\`\`\`js
function UserList() {
  const { data, loading, error } = useFetch('/api/users');
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'React',
    role: 'FE',
    level: 'junior',
    tags: ['react', 'hooks', 'fetch', 'async', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => { if (!cancelled) setData(data); })
      .catch(err => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}`,
    hints: ['cancelled flag để tránh setState trên unmounted component', 'Cleanup trong useEffect return'],
  },
  {
    content: `Implement hàm \`virtualDiff(oldTree, newTree)\` so sánh 2 Virtual DOM và trả về list patches cần apply.

Mỗi node có dạng: \`{ type, props, children }\`.

Chỉ cần xử lý các trường hợp:
- Node bị xóa (REMOVE)
- Node được thêm (ADD)
- Props thay đổi (UPDATE_PROPS)

\`\`\`js
const patches = virtualDiff(oldTree, newTree);
// [{ type: 'UPDATE_PROPS', node: ..., props: {...} }, ...]
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'React',
    role: 'FE',
    level: 'senior',
    tags: ['react', 'virtual dom', 'diff', 'algorithm', 'coding'],
    expectedDuration: 600,
    sampleAnswer: `function virtualDiff(oldNode, newNode, patches = [], index = 0) {
  if (!newNode) {
    patches.push({ type: 'REMOVE', index });
  } else if (!oldNode) {
    patches.push({ type: 'ADD', index, node: newNode });
  } else if (oldNode.type !== newNode.type) {
    patches.push({ type: 'REPLACE', index, node: newNode });
  } else {
    // So sánh props
    const propDiff = {};
    const allKeys = new Set([...Object.keys(oldNode.props || {}), ...Object.keys(newNode.props || {})]);
    for (const key of allKeys) {
      if (oldNode.props?.[key] !== newNode.props?.[key]) {
        propDiff[key] = newNode.props?.[key];
      }
    }
    if (Object.keys(propDiff).length > 0) {
      patches.push({ type: 'UPDATE_PROPS', index, props: propDiff });
    }
    // Đệ quy children
    const maxLen = Math.max(
      (oldNode.children || []).length,
      (newNode.children || []).length
    );
    for (let i = 0; i < maxLen; i++) {
      virtualDiff(oldNode.children?.[i], newNode.children?.[i], patches, \`\${index}.\${i}\`);
    }
  }
  return patches;
}`,
    hints: ['So sánh từng cặp node', 'Đệ quy vào children', 'Track index để biết vị trí trong tree'],
  },
  {
    content: `Implement Infinite Scroll hook \`useInfiniteScroll(fetchMore)\` — gọi \`fetchMore\` khi user scroll đến cuối trang.

\`\`\`js
function Feed() {
  const [items, setItems] = useState([]);
  const loader = useInfiniteScroll(() => {
    fetchNextPage().then(newItems => setItems(prev => [...prev, ...newItems]));
  });
  return (
    <div>
      {items.map(item => <Item key={item.id} {...item} />)}
      <div ref={loader} />
    </div>
  );
}
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'React',
    role: 'FE',
    level: 'middle',
    tags: ['react', 'intersection observer', 'infinite scroll', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `import { useRef, useEffect, useCallback } from 'react';

function useInfiniteScroll(fetchMore) {
  const loaderRef = useRef(null);

  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) fetchMore();
  }, [fetchMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      threshold: 0.1,
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return loaderRef;
}`,
    hints: ['Dùng IntersectionObserver để detect khi loader div visible', 'Disconnect observer khi cleanup'],
  },
  {
    content: `Implement \`useDebounce(value, delay)\` hook — trả về giá trị debounced.

\`\`\`js
function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery) search(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'easy',
    topic: 'React',
    role: 'FE',
    level: 'junior',
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
    hints: ['useEffect chạy lại khi value thay đổi', 'Cleanup clearTimeout trong return'],
  },

  // ─── Backend / Node.js (3) ──────────────────────────────────────────────────
  {
    content: `Implement middleware \`rateLimit({ windowMs, max })\` cho Express — giới hạn số request trong một khoảng thời gian.

\`\`\`js
app.use(rateLimit({ windowMs: 60000, max: 100 }));
// Mỗi IP chỉ được gọi tối đa 100 request / phút
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'Node.js',
    role: 'BE',
    level: 'middle',
    tags: ['node.js', 'express', 'rate limit', 'middleware', 'coding'],
    expectedDuration: 480,
    sampleAnswer: `function rateLimit({ windowMs, max }) {
  const store = new Map(); // ip → { count, resetTime }
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    if (!store.has(ip) || store.get(ip).resetTime < now) {
      store.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    const record = store.get(ip);
    if (record.count >= max) {
      return res.status(429).json({ message: 'Too many requests' });
    }
    record.count++;
    next();
  };
}`,
    hints: ['Map: ip → {count, resetTime}', 'Reset window khi resetTime < now', '429 Too Many Requests khi vượt max'],
  },
  {
    content: `Implement hàm \`retry(fn, retries, delay)\` — thử lại async function khi thất bại, với exponential backoff.

\`\`\`js
const result = await retry(
  () => fetch('https://api.example.com/data'),
  3,   // max retries
  1000 // initial delay ms
);
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'medium',
    topic: 'Node.js',
    role: 'BE',
    level: 'junior',
    tags: ['node.js', 'async', 'retry', 'exponential backoff', 'coding'],
    expectedDuration: 360,
    sampleAnswer: `async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2); // exponential backoff
  }
}`,
    hints: ['Đệ quy: retry(fn, retries - 1, delay * 2)', 'Throw error khi retries = 0'],
  },
  {
    content: `Implement \`compose(...middlewares)\` — kết hợp nhiều Express middleware thành 1 middleware duy nhất.

\`\`\`js
const combined = compose(
  cors(),
  helmet(),
  rateLimit({ max: 100 }),
);
app.use(combined);
\`\`\``,
    category: 'technical',
    type: 'coding',
    difficulty: 'hard',
    topic: 'Node.js',
    role: 'BE',
    level: 'middle',
    tags: ['node.js', 'express', 'middleware', 'compose', 'coding'],
    expectedDuration: 420,
    sampleAnswer: `function compose(...middlewares) {
  return (req, res, next) => {
    let index = 0;
    function dispatch(i) {
      if (i >= middlewares.length) return next();
      const fn = middlewares[i];
      try {
        fn(req, res, () => dispatch(i + 1));
      } catch (err) {
        next(err);
      }
    }
    dispatch(0);
  };
}`,
    hints: ['Mỗi middleware gọi next() để sang middleware tiếp theo', 'Dùng dispatch(i+1) thay vì next để chain'],
  },
];

const seedCodingQuestions = async () => {
  try {
    const count = await Question.countDocuments({ type: 'coding' });
    if (count > 0) {
      console.log(`[Seeder] ${count} coding questions already exist — skipping`);
      return;
    }
    await Question.insertMany(codingQuestions);
    console.log(`[Seeder] Seeded ${codingQuestions.length} coding questions successfully.`);
  } catch (err) {
    console.error('[Seeder] Failed to seed coding questions:', err.message);
  }
};

module.exports = seedCodingQuestions;
