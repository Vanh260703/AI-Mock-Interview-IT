# FE Documentation — AI Mock Interview IT

> File này là tài liệu kỹ thuật để build toàn bộ Frontend.
> Backend base URL (Docker): `http://localhost:3000`
> Frontend dev server: `http://localhost:8080`
> Vite proxy `/api → http://localhost:3000` đã được cấu hình.

---

## 1. Tech Stack

| Thứ | Package | Lý do |
|-----|---------|-------|
| Framework | React 18 + Vite 5 | đã cài sẵn |
| Routing | `react-router-dom` v6 | SPA routing |
| State | `zustand` | lightweight, không boilerplate |
| HTTP | `axios` | interceptor để auto-attach token & refresh |
| Styling | `tailwindcss` + `shadcn/ui` hoặc `antd` | tùy chọn |
| Charts | `recharts` | progress chart 30 ngày |
| Form | `react-hook-form` + `zod` | validation |
| Media | `react-media-recorder` | record audio/video trong browser |
| Toast | `react-hot-toast` | thông báo |
| Icons | `lucide-react` | nhất quán với shadcn |
| Timer | custom hook | countdown per question |

---

## 2. Cấu trúc thư mục gợi ý

```
FE/src/
├── api/                    # axios instance + tất cả API calls
│   ├── axios.js            # base instance, interceptors
│   ├── auth.api.js
│   ├── interview.api.js
│   ├── feedback.api.js
│   ├── question.api.js
│   └── user.api.js
├── store/                  # zustand stores
│   ├── auth.store.js
│   └── interview.store.js
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── ResetPasswordPage.jsx
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── interview/
│   │   ├── SetupPage.jsx
│   │   ├── SessionPage.jsx        # màn hình phỏng vấn chính
│   │   └── ResultPage.jsx
│   ├── history/
│   │   ├── HistoryPage.jsx
│   │   └── HistoryDetailPage.jsx
│   ├── profile/
│   │   └── ProfilePage.jsx
│   ├── questions/
│   │   └── QuestionBankPage.jsx
│   └── admin/
│       ├── AdminUsersPage.jsx
│       └── AdminSystemPage.jsx
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx          # sidebar + header
│   │   ├── AuthLayout.jsx         # centered card layout
│   │   └── ProtectedRoute.jsx
│   ├── interview/
│   │   ├── QuestionCard.jsx
│   │   ├── AnswerRecorder.jsx     # record audio/video
│   │   ├── CountdownTimer.jsx
│   │   └── ProgressBar.jsx
│   ├── feedback/
│   │   ├── ScoreCard.jsx
│   │   ├── MetricsRadar.jsx       # radar chart 5 metrics
│   │   ├── FeedbackPanel.jsx
│   │   └── GradingProgress.jsx    # polling UI
│   ├── dashboard/
│   │   ├── StatsGrid.jsx
│   │   ├── StreakBadge.jsx
│   │   └── ProgressChart.jsx      # recharts
│   └── ui/                        # shared components
│       ├── Badge.jsx
│       ├── LoadingSpinner.jsx
│       └── EmptyState.jsx
└── hooks/
    ├── useAuth.js
    ├── useCountdown.js
    ├── useFeedbackPolling.js
    └── useMediaRecorder.js
```

---

## 3. Auth Setup

### 3.1 Lưu trữ token

```
accessToken → memory (zustand store) — KHÔNG lưu localStorage
refreshToken → httpOnly cookie (BE tự set, FE không đọc được)
```

### 3.2 Axios Instance (`api/axios.js`)

```js
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({ baseURL: '/api', withCredentials: true });

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh khi 401
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        const newToken = data.accessToken;
        useAuthStore.getState().setToken(newToken);
        queue.forEach(({ resolve }) => resolve(newToken));
        queue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        queue.forEach(({ reject }) => reject());
        queue = [];
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3.3 Auth Store (`store/auth.store.js`)

```js
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  setSession: (user, accessToken) => set({ user, accessToken }),
  setToken: (accessToken) => set({ accessToken }),
  logout: () => set({ user: null, accessToken: null }),
}));
```

---

## 4. API Reference

### 4.1 Auth API (`api/auth.api.js`)

```js
// POST /api/auth/register
// Body: { email, password, gender? }
register({ email, password, gender })

// POST /api/auth/login
// Body: { identifier, password }  — identifier = email hoặc username
// Returns: { accessToken, user: { id, email, username, gender, avatar, role } }
login({ identifier, password })

// POST /api/auth/logout  (cần Bearer token)
logout()

// POST /api/auth/refresh-token  (dùng cookie, không cần Bearer)
refreshToken()

// POST /api/auth/forgot-password
// Body: { email }
forgotPassword({ email })

// POST /api/auth/reset-password/:token
// Body: { password }
resetPassword(token, { password })

// POST /api/auth/google
// Body: { code }  — authorization code từ Google OAuth
loginWithGoogle({ code })

// POST /api/auth/facebook
// Body: { code }
loginWithFacebook({ code })
```

### 4.2 Interview API (`api/interview.api.js`)

```js
// POST /api/interviews
// Body:
// {
//   level: 'intern'|'fresher'|'junior'|'middle'|'senior',  ← BẮT BUỘC
//   role: 'FE'|'BE'|'FS'|'BA'|'DA'|'DS'|'DevOps'|'Mobile'|'General',
//   type: 'technical'|'behavioral'|'mixed',
//   questionCount: 1-20,
//   timePerQuestion: giây (default 120),
// }
// Returns: { data: { _id, questions: [...], settings, status: 'in_progress', ... } }
createSession(body)

// GET /api/interviews?page=1&limit=10&status=completed
getSessions({ page, limit, status })

// GET /api/interviews/:id
// Returns: { data: { session, answers, feedbacks } }
getSession(id)

// POST /api/interviews/:id/answers
// multipart/form-data hoặc JSON
// Fields:
//   questionId: string  ← BẮT BUỘC
//   content: string     ← text trả lời (nếu không upload file)
//   duration: giây
//   status: 'submitted'|'skipped'|'drafted'
//   media: File (audio/video, max 200MB)  ← nếu gửi file, content có thể bỏ trống → BE tự transcribe
// Returns: { data: { answer: {...} } }
submitAnswer(sessionId, formData)

// PUT /api/interviews/:id/complete
// Returns: { data: { session: { _id, status: 'completed', completedAt, duration } } }
completeSession(id)
```

### 4.3 Feedback API (`api/feedback.api.js`)

```js
// GET /api/feedback/session/:sessionId
// Returns:
// {
//   data: {
//     session: { _id, status, overallScore },
//     progress: { total, graded, isComplete },
//     answerFeedbacks: [ feedback objects ],
//     sessionFeedback: feedback object | null
//   }
// }
getSessionFeedback(sessionId)

// POST /api/feedback/session/:sessionId  — trigger manual nếu cần
requestFeedback(sessionId)
```

**Cấu trúc 1 feedback object:**
```js
{
  _id, session, user, type: 'answer'|'session',
  answer: { _id, content, duration, question } | null,
  overallScore: 0-100,
  metrics: {
    clarity: 0-10,
    relevance: 0-10,
    technicalAccuracy: 0-10,
    communication: 0-10,
    confidence: 0-10,
  },
  strengths: string[],
  improvements: string[],
  summary: string,
  keywords: string[],  // chỉ có ở answer feedback
  generatedBy: 'ai',
  createdAt, updatedAt
}
```

### 4.4 Question API (`api/question.api.js`)

```js
// GET /api/questions?role=FE&level=intern&difficulty=easy&category=technical&page=1&limit=10
getQuestions({ role, level, difficulty, category, topic, page, limit })

// GET /api/questions/random?role=BE&level=junior&limit=5
getRandomQuestions({ role, level, difficulty, limit })

// GET /api/questions/categories
// Returns: [{ category, total, difficulties: { easy, medium, hard } }]
getCategories()

// GET /api/questions/:id
// Returns: { data: { ...question với sampleAnswer và hints } }
getQuestion(id)
```

### 4.5 User API (`api/user.api.js`)

```js
// GET /api/users/me/stats
// Returns:
// {
//   data: {
//     totalSessions, totalAnswers,
//     avgScore: number|null,
//     bestScore: number|null,
//     streak: number,         // ngày liên tiếp
//     completionRate: number, // %
//     totalDuration: number,  // giây
//     favoriteRole: string|null,
//     favoriteLevel: string|null
//   }
// }
getMyStats()

// GET /api/users/me/progress?days=30
// days: 7–90, default 30
// Returns:
// {
//   data: {
//     days, since: 'YYYY-MM-DD',
//     progress: [{ date, avgScore, bestScore, sessionCount }]
//   }
// }
getMyProgress({ days })
```

---

## 5. Pages & Routing

### 5.1 Route Structure

```jsx
<BrowserRouter>
  <Routes>
    {/* Public */}
    <Route path="/login"              element={<LoginPage />} />
    <Route path="/register"           element={<RegisterPage />} />
    <Route path="/forgot-password"    element={<ForgotPasswordPage />} />
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

    {/* Protected */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/"                    element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard"           element={<DashboardPage />} />
        <Route path="/interview/setup"     element={<SetupPage />} />
        <Route path="/interview/:id"       element={<SessionPage />} />
        <Route path="/interview/:id/results" element={<ResultPage />} />
        <Route path="/history"             element={<HistoryPage />} />
        <Route path="/history/:id"         element={<HistoryDetailPage />} />
        <Route path="/profile"             element={<ProfilePage />} />
        <Route path="/questions"           element={<QuestionBankPage />} />
      </Route>
    </Route>

    {/* Admin */}
    <Route element={<ProtectedRoute requiredRole="admin" />}>
      <Route element={<AppLayout />}>
        <Route path="/admin/users"   element={<AdminUsersPage />} />
        <Route path="/admin/system"  element={<AdminSystemPage />} />
      </Route>
    </Route>
  </Routes>
</BrowserRouter>
```

### 5.2 ProtectedRoute

```jsx
const ProtectedRoute = ({ requiredRole }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
```

---

## 6. Màn hình chi tiết

### 6.1 LoginPage (`/login`)

**UI:** Form 2 field + nút Login + link Google/Facebook OAuth + link Register + link Forgot Password

**Flow:**
```
submit { identifier, password }
  → POST /api/auth/login
  → nhận { accessToken, user }
  → setSession(user, accessToken)
  → navigate('/dashboard')
```

**Google OAuth flow:**
```
Click "Login with Google"
  → redirect đến Google consent page với CLIENT_ID + redirect_uri
  → Google redirect về /login?code=xxx
  → POST /api/auth/google { code }
  → nhận session → navigate dashboard
```

**Validation (zod):**
```js
{ identifier: z.string().min(1), password: z.string().min(6) }
```

---

### 6.2 RegisterPage (`/register`)

**UI:** email, password, confirm password, gender (optional)

**Flow:**
```
submit { email, password }
  → POST /api/auth/register
  → hiển thị toast: "Kiểm tra email để xác thực tài khoản"
  → navigate('/login')
```

---

### 6.3 DashboardPage (`/dashboard`)

**Sections:**
1. **Stats Grid** — 4 card: Total Sessions, Avg Score, Best Score, Streak
2. **Progress Chart** — Line chart 30 ngày (recharts) từ GET /api/users/me/progress
3. **Recent Sessions** — danh sách 5 session gần nhất từ GET /api/interviews?limit=5
4. **CTA** — nút "Bắt đầu phỏng vấn mới" → navigate('/interview/setup')

**Data fetching (parallel):**
```js
const [stats, progress, sessions] = await Promise.all([
  getMyStats(),
  getMyProgress({ days: 30 }),
  getSessions({ limit: 5, status: 'completed' }),
]);
```

**ProgressChart:**
```jsx
<LineChart data={progress}>
  <Line dataKey="avgScore" name="Điểm TB" stroke="#6366f1" />
  <Line dataKey="bestScore" name="Điểm cao nhất" stroke="#10b981" strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis domain={[0, 100]} />
</LineChart>
```

---

### 6.4 SetupPage (`/interview/setup`)

**UI:** Form chọn thông số → tạo session

**Fields:**
```
Level (required):   intern | fresher | junior | middle | senior
Role:               FE | BE | FS | BA | DA | DS | DevOps | Mobile | General
Type:               technical | behavioral | mixed
Question Count:     1–20 (slider hoặc number input)
Time per Question:  30s | 60s | 90s | 120s | 180s (select)
```

**Mapping hiển thị:**
```
Level → Difficulty tương ứng (hiển thị preview):
  intern/fresher → Easy
  junior         → Medium
  middle/senior  → Hard
```

**Flow:**
```
submit
  → POST /api/interviews { level, role, type, questionCount, timePerQuestion }
  → nhận { data: { _id, questions } }
  → navigate(`/interview/${_id}`)
```

**Lưu ý:** Nếu BE trả 404 "No questions found" → hiển thị toast warning, thử lại với role=General.

---

### 6.5 SessionPage (`/interview/:id`) ← MÀN HÌNH CHÍNH

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Session Info Bar: "Câu 2/5 | FE | intern | 01:30"  │
├────────────────────────────┬────────────────────────┤
│                            │                        │
│    QuestionCard            │    AnswerPanel          │
│    (câu hỏi hiện tại)      │    (record/type)       │
│                            │                        │
├────────────────────────────┴────────────────────────┤
│  [Skip]  [Ghi âm/Quay video]  [Gõ câu trả lời]  [Next →] │
└─────────────────────────────────────────────────────┘
```

**State cần quản lý:**
```js
const [currentIndex, setCurrentIndex] = useState(0);
const [answers, setAnswers] = useState({}); // { questionId: { content, mediaFile, status } }
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Session data:** lấy từ navigate state hoặc GET /api/interviews/:id

**CountdownTimer hook:**
```js
const useCountdown = (seconds, onExpire) => {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining]);
  return remaining;
};
```

**AnswerRecorder component:**
- Tab 1: "Gõ câu trả lời" → `<textarea>`
- Tab 2: "Ghi âm" → `react-media-recorder` (audio)
- Tab 3: "Quay video" → `react-media-recorder` (video)

**Submit answer flow:**
```
Click Next / hết giờ
  → nếu có media file: gửi FormData (content rỗng → BE tự transcribe)
  → nếu có text: gửi JSON { questionId, content, duration, status: 'submitted' }
  → nếu skip: gửi { questionId, content: '', status: 'skipped' }
  → POST /api/interviews/:id/answers
  → currentIndex++

Câu cuối cùng:
  → submit answer
  → PUT /api/interviews/:id/complete
  → navigate(`/interview/:id/results`)
```

**Gửi FormData khi có media:**
```js
const fd = new FormData();
fd.append('questionId', questionId);
fd.append('duration', duration);
fd.append('status', 'submitted');
fd.append('media', mediaBlob, 'answer.webm');
// content bỏ trống → BE tự transcribe qua Whisper
await submitAnswer(sessionId, fd);
```

**Ngăn thoát giữa chừng:**
```js
useEffect(() => {
  const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, []);
```

---

### 6.6 ResultPage (`/interview/:id/results`)

**Mục đích:** Hiển thị kết quả sau khi hoàn thành, chờ AI chấm xong.

**Polling logic (`hooks/useFeedbackPolling.js`):**
```js
const useFeedbackPolling = (sessionId) => {
  const [feedback, setFeedback] = useState(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const poll = async () => {
      const res = await getSessionFeedback(sessionId);
      setFeedback(res.data);
      if (res.data.progress.isComplete) {
        setIsDone(true);
      }
    };

    poll(); // gọi ngay lần đầu
    const interval = setInterval(poll, 3000); // poll mỗi 3 giây
    return () => clearInterval(interval);
  }, [sessionId]);

  return { feedback, isDone };
};
```

**UI states:**
1. **Đang chờ** (`!isDone`):
   ```
   ⏳ AI đang chấm điểm...
   Đã chấm: 2/5 câu
   [ProgressBar]
   ```
2. **Hoàn thành** (`isDone`):
   - **Session Score Card**: điểm tổng, metrics radar chart
   - **Session Feedback**: strengths, improvements, summary
   - **Danh sách từng câu**: overallScore + summary ngắn
   - Nút "Xem chi tiết từng câu" (expand)
   - Nút "Phỏng vấn lại" → navigate('/interview/setup')

**MetricsRadar (recharts):**
```jsx
<RadarChart data={[
  { metric: 'Rõ ràng', score: metrics.clarity * 10 },
  { metric: 'Liên quan', score: metrics.relevance * 10 },
  { metric: 'Kỹ thuật', score: metrics.technicalAccuracy * 10 },
  { metric: 'Giao tiếp', score: metrics.communication * 10 },
  { metric: 'Tự tin', score: metrics.confidence * 10 },
]}>
  <Radar dataKey="score" fill="#6366f1" fillOpacity={0.4} />
</RadarChart>
```

---

### 6.7 HistoryPage (`/history`)

**UI:** Danh sách sessions + filter + phân trang

**Filters:**
```
status: all | completed | in_progress | abandoned
```

**Session card hiển thị:**
```
[Date] [Role] [Level] [Type]    overallScore: 82 ★
Intern | FE | 5 câu | 12 phút
```

**Flow:** click card → navigate(`/history/:id`)

---

### 6.8 HistoryDetailPage (`/history/:id`)

**Data:** GET /api/interviews/:id → `{ session, answers, feedbacks }`

**Sections:**
1. Session overview (settings, duration, overallScore)
2. Danh sách câu hỏi + câu trả lời + điểm từng câu
3. Session feedback tổng quát (nếu có)

---

### 6.9 ProfilePage (`/profile`)

**Sections:**
1. **User Info**: avatar, email, username, role
2. **Stats**: reuse StatsGrid từ Dashboard
3. **Progress Chart**: 90 ngày

---

### 6.10 QuestionBankPage (`/questions`)

**Filter bar:**
```
Role | Level | Difficulty | Category | Search (topic keyword)
```

**Question list:** phân trang, không hiển thị sampleAnswer

**Click question:** modal/drawer → hiển thị full question với hints

---

## 7. Key UX Rules

### 7.1 Error handling

```js
// Wrap tất cả API calls
try {
  const res = await api.post(...);
} catch (err) {
  const msg = err.response?.data?.message ?? 'Lỗi không xác định';
  toast.error(msg);
}
```

### 7.2 Loading states

- Skeleton UI cho data loading (không dùng spinner toàn màn hình)
- Disable button khi đang submit

### 7.3 Score color coding

```js
const scoreColor = (score) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};
```

### 7.4 Level → Difficulty display

```js
const LEVEL_MAP = {
  intern:  { label: 'Intern',  difficulty: 'Easy',   color: 'green'  },
  fresher: { label: 'Fresher', difficulty: 'Easy',   color: 'green'  },
  junior:  { label: 'Junior',  difficulty: 'Medium', color: 'yellow' },
  middle:  { label: 'Middle',  difficulty: 'Hard',   color: 'orange' },
  senior:  { label: 'Senior',  difficulty: 'Hard',   color: 'red'    },
};
```

### 7.5 Session status badge

```js
const STATUS_BADGE = {
  in_progress: { label: 'Đang làm',   color: 'blue'   },
  completed:   { label: 'Hoàn thành', color: 'green'  },
  abandoned:   { label: 'Bỏ dở',      color: 'gray'   },
  pending:     { label: 'Chờ',        color: 'yellow' },
};
```

---

## 8. Luồng phỏng vấn hoàn chỉnh (Full Flow)

```
[Setup] Chọn level/role/type/questionCount
    ↓  POST /api/interviews
[Session] Câu hỏi 1..N
    ↓  (mỗi câu) POST /api/interviews/:id/answers
    ↓  (hết câu) PUT /api/interviews/:id/complete
[Results - chờ AI]
    ↓  Poll GET /api/feedback/session/:id mỗi 3s
    ↓  Khi isComplete=true → hiển thị kết quả
[Results - xem điểm]
    → Radar chart metrics
    → Điểm từng câu
    → Nhận xét AI
```

---

## 9. Vite Proxy Config (`vite.config.js`)

```js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 10. Env Variables (FE)

Không cần env file riêng vì toàn bộ gọi qua proxy `/api`.

Nếu cần OAuth client IDs:
```
VITE_GOOGLE_CLIENT_ID=xxx
VITE_FACEBOOK_APP_ID=xxx
```

---

## 11. Cài đặt packages cần thiết

```bash
npm install react-router-dom axios zustand react-hook-form zod @hookform/resolvers \
            react-hot-toast lucide-react recharts react-media-recorder

# Nếu dùng Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 12. Tóm tắt nhanh các endpoint cần thiết

| Feature | Method | Endpoint |
|---------|--------|----------|
| Login | POST | `/api/auth/login` |
| Register | POST | `/api/auth/register` |
| Logout | POST | `/api/auth/logout` |
| Refresh token | POST | `/api/auth/refresh-token` |
| Tạo session | POST | `/api/interviews` |
| Danh sách sessions | GET | `/api/interviews` |
| Chi tiết session | GET | `/api/interviews/:id` |
| Submit câu trả lời | POST | `/api/interviews/:id/answers` |
| Hoàn thành session | PUT | `/api/interviews/:id/complete` |
| Lấy feedback | GET | `/api/feedback/session/:id` |
| Stats cá nhân | GET | `/api/users/me/stats` |
| Progress 30 ngày | GET | `/api/users/me/progress` |
| Danh sách câu hỏi | GET | `/api/questions` |
| Câu hỏi random | GET | `/api/questions/random` |
| Chi tiết câu hỏi | GET | `/api/questions/:id` |
