# AI Mock Interview IT

A full-stack web application that simulates technical interviews with AI-powered feedback. Users can practice behavioral, technical, and coding questions, receive detailed scoring, track progress over time, and connect with other candidates.

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20 (Alpine) | Runtime environment |
| **Express.js** | 4.x | HTTP server & REST API framework |
| **MongoDB** | 7 | Primary database (document store) |
| **Mongoose** | 8.x | MongoDB ODM with schema validation |
| **Redis** | 7 (Alpine) | JWT refresh token storage, Bull queue broker, Socket.IO adapter |
| **Socket.IO** | 4.x | Real-time bidirectional communication (chat) |
| **@socket.io/redis-adapter** | 8.x | Scale Socket.IO across multiple instances via Redis |
| **Bull** | 4.x | Background job queue for async AI feedback generation |
| **Groq SDK** | 1.x | AI API client — `llama-3.3-70b-versatile` for grading, `whisper-large-v3` for audio transcription |
| **jsonwebtoken** | 9.x | Access & refresh token generation/verification |
| **bcryptjs** | 2.x | Password hashing (rounds: 10) |
| **Multer** | 2.x | Multipart file upload handling (audio/video answers) |
| **Cloudinary** | 2.x | Cloud media storage for audio/video recordings |
| **Nodemailer** | 6.x | Transactional email (verification, password reset) via Gmail SMTP |
| **express-rate-limit** | 8.x | Rate limiting — 100 req/15min (general), 10 req/15min (login) |
| **Helmet** | 7.x | HTTP security headers |
| **Morgan** | 1.x | HTTP request logging |
| **dotenv** | 16.x | Environment variable management |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | UI component library |
| **Vite** | 5.x | Build tool & dev server with HMR |
| **React Router DOM** | 7.x | Client-side SPA routing |
| **Zustand** | 5.x | Lightweight global state management |
| **Axios** | 1.x | HTTP client with interceptors for token refresh |
| **Socket.IO Client** | 4.x | Real-time chat & notifications |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **React Hook Form** | 7.x | Performant form state management |
| **Zod** | 4.x | Schema-based form validation |
| **Recharts** | 3.x | Progress charts and performance visualization |
| **Monaco Editor** | 4.x (`@monaco-editor/react`) | In-browser VS Code-grade code editor for coding questions |
| **React Markdown** | 10.x | Render markdown in question content & feedback |
| **remark-gfm** | 4.x | GitHub Flavored Markdown support |
| **Lucide React** | 1.x | Icon library |
| **React Hot Toast** | 2.x | Toast notification system |

### Infrastructure & DevOps

| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration (4 services) |
| **Nginx** | Serve React SPA + reverse proxy `/api` and `/socket.io` to backend |
| **Makefile** | Developer convenience commands (`make up`, `make build`, etc.) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                         │
│                                                           │
│  ┌──────────┐    ┌──────────┐    ┌────────┬──────────┐  │
│  │  Nginx   │───▶│ Express  │───▶│ Mongo  │  Redis   │  │
│  │ :8080    │    │  :3000   │    │ :27017 │  :6379   │  │
│  │ React SPA│    │ REST API │    └────────┴──────────┘  │
│  └──────────┘    │ Socket.IO│          ▲       ▲        │
│                  │ Bull     │──────────┘       │        │
│                  └──────────┘                  │        │
│                       │                  Bull Queue      │
│                       ▼                  Token Store     │
│                  ┌─────────┐            Socket Adapter   │
│                  │ Groq AI │                             │
│                  │ (cloud) │                             │
│                  └─────────┘                             │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### Mock Interview Sessions
- **Three interview types** — Technical, Behavioral, or Mixed question sets
- **Smart filtering** — Questions filtered by role (FE, BE, FS, DA, DS, DevOps, Mobile, BA), experience level (intern → senior), difficulty, and custom tags
- **Technical sessions** — Filter by difficulty rather than level, so intern-level users correctly receive easy-difficulty technical questions alongside coding challenges
- **Mixed sessions** — ~20% coding questions, ~80% behavioral/technical blend, shuffled randomly
- **Per-question timer** — Coding questions use `expectedDuration` (default 10 min); text questions use the session time setting

### Coding Questions (LeetCode-Style)
- **Split-panel layout** — Dark left panel (question) + right Monaco editor panel, inspired by LeetCode
- **Structured question panel** — Parses question markdown into title, description, examples (Input/Output/Explanation), constraints list, and collapsible hints
- **Monaco editor** — VS Code-grade editor with syntax highlighting for JavaScript, TypeScript, Python, Java, and C++; language switcher preserves user edits
- **Deferred AI grading** — Coding answers are queued for AI grading only after the session is completed, not on each answer submission

### Multi-Format Answers
- **Text** — Rich textarea with live character count
- **Audio/Video** — Browser MediaRecorder API; recordings auto-uploaded to Cloudinary
- **Speech-to-text** — Audio files transcribed via Groq Whisper when no text is provided
- **Skip** — Any non-last question can be skipped; skipped answers are recorded with `status: 'skipped'`

### AI Feedback
- **Per-answer scores** — Clarity, relevance, technical accuracy, communication, confidence (scored 1–10)
- **Session summary** — Overall performance analysis generated after all answers are graded
- **Async pipeline** — Bull job queue with 3 retry attempts and exponential backoff; feedback polled on the results page
- **Coding answer grading** — Deferred to session completion to batch all coding answers in one pass

### Progress & History
- Interview history with status, score, and question breakdown
- 30-day performance charts (Recharts)
- Statistics dashboard: total sessions, average score, time spent, improvement trends

### Social
- Friend request system (send, accept, decline)
- User search by name or email
- Real-time messaging via Socket.IO with Redis adapter for multi-instance support
- Online presence indicators

### Authentication & Security
- Email/password registration with email verification
- Google OAuth and Facebook OAuth
- JWT access tokens (30 min) + Redis-backed refresh tokens (7 days)
- Password reset via email
- Helmet security headers, CORS, rate limiting on auth and email endpoints

### Admin Panel
- User management (list, search, suspend)
- System statistics

---

## Project Structure

```
AI Mock Interview IT/
├── BE/                          # Node.js backend
│   ├── src/
│   │   ├── config/              # Database, Redis, Bull, Groq, Cloudinary, rate-limit
│   │   ├── models/              # 8 Mongoose schemas (with compound indexes)
│   │   ├── controllers/         # Request handlers
│   │   ├── routes/              # Express routers
│   │   ├── services/            # ai.service.js, email.service.js, token.service.js
│   │   ├── middlewares/         # auth.middleware.js, upload.middleware.js
│   │   ├── workers/             # feedback.worker.js (Bull job processor)
│   │   ├── seeders/             # Seed scripts for questions & users
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Entry point
│   ├── Dockerfile
│   └── .env.example
│
├── FE/                          # React frontend
│   ├── src/
│   │   ├── api/                 # Axios instance & interceptors
│   │   ├── pages/               # Page components (auth, dashboard, interview, history, profile, friends, messages, admin)
│   │   ├── components/          # Shared UI components
│   │   │   └── interview/       # CountdownTimer, AnswerRecorder, CodeEditor, LeetCodeQuestionPanel
│   │   ├── hooks/               # useAuth, useCountdown, useFeedbackPolling, useMediaRecorder
│   │   ├── store/               # Zustand stores (auth, interview, notification)
│   │   ├── lib/                 # Socket.IO client setup, constants
│   │   └── App.jsx
│   ├── nginx.conf
│   └── Dockerfile
│
├── load-test/                   # autocannon load test scripts (DB & auth benchmarks)
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## Database Indexes

Compound indexes are defined directly in each Mongoose schema for consistent, zero-migration deployment:

| Model | Indexes |
|---|---|
| `Question` | `{isActive, category, difficulty, topic}`, `{isActive, role, level}`, `{tags}` |
| `Answer` | `{session, question, user}` (unique), `{session, status}`, `{user}` |
| `InterviewSession` | `{user, status}`, `{user, status, completedAt}`, `{user, createdAt}` |
| `User` | `{emailVerificationToken}` (sparse), `{resetPasswordToken}` (sparse) |
| `Conversation` | `{participants, updatedAt}` |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- A [Groq API key](https://console.groq.com)
- A Cloudinary account (for audio/video upload)
- Gmail account with App Password enabled (for email)

### Setup

1. **Clone the repository**

```bash
git clone <repo-url>
cd "AI Mock Interview IT"
```

2. **Configure environment variables**

```bash
cp BE/.env.example BE/.env.docker
# Edit BE/.env.docker with your actual keys
```

3. **Start all services**

```bash
make up
# or: docker compose up -d --build
```

4. **Seed the database** (optional)

```bash
docker compose exec backend node src/seeders/question.seeder.js
docker compose exec backend node src/seeders/admin.seeder.js
```

The app will be available at `http://localhost:8080`.

### Development (without Docker)

```bash
# Backend
make dev-be   # installs dependencies
cd BE && npm run dev

# Frontend
make dev-fe   # installs dependencies
cd FE && npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3000`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | JWT signing secret for access tokens |
| `REFRESH_TOKEN_SECRET` | JWT signing secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRES` | Access token TTL (e.g. `30m`) |
| `REFRESH_TOKEN_EXPIRES` | Refresh token TTL (e.g. `7d`) |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `GROQ_API_KEY` | Groq AI API key |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Email (Gmail SMTP) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `CLIENT_URL` | Allowed CORS origin |

---

## API Routes

| Prefix | Description |
|---|---|
| `POST /api/auth/*` | Register, login, logout, refresh token, OAuth, password reset |
| `GET/POST /api/interviews/*` | Create sessions, submit answers, complete sessions |
| `GET /api/questions/*` | Browse and filter question bank |
| `POST/GET /api/feedback/*` | Enqueue and retrieve AI feedback |
| `GET/PATCH /api/users/*` | Profile, stats, progress, avatar upload |
| `GET/POST /api/social/*` | Friend requests, search, friends list |
| `GET/POST /api/chat/*` | Conversations and messages |
| `GET/POST /api/admin/*` | User management, system stats (admin only) |
| `GET /api/health` | Health check |
