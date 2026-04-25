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
| **bcryptjs** | 2.x | Password hashing |
| **Multer** | 2.x | Multipart file upload handling (audio/video answers) |
| **Cloudinary** | 2.x | Cloud media storage for audio/video recordings |
| **Nodemailer** | 6.x | Transactional email (verification, password reset) via Gmail SMTP |
| **express-rate-limit** | 8.x | Rate limiting on auth endpoints |
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
| **Monaco Editor** | 4.x (`@monaco-editor/react`) | In-browser code editor for coding questions |
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

- **Mock Interviews** — Technical, behavioral, or mixed question sets filtered by role, level, difficulty, and topic
- **Coding Questions** — LeetCode-style questions with an in-browser Monaco editor (20% of mixed sessions)
- **Multi-Format Answers** — Text, audio, or video submissions; audio/video transcribed via Whisper
- **AI Feedback** — Async grading via Bull + Groq with per-answer scores (clarity, relevance, technical accuracy, communication, confidence) and session-level summary
- **Progress Tracking** — Interview history, 30-day performance charts, statistics dashboard
- **Social** — Friend requests, user search, real-time messaging via Socket.IO
- **Authentication** — Email/password with verification, Google OAuth, Facebook OAuth, JWT + Redis refresh tokens
- **Admin** — User management and system statistics panel

---

## Project Structure

```
AI Mock Interview IT/
├── BE/                          # Node.js backend
│   ├── src/
│   │   ├── config/              # Database, Redis, Bull, Groq, Cloudinary, rate-limit
│   │   ├── models/              # 8 Mongoose schemas
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
│   │   ├── pages/               # 17 page components
│   │   ├── components/          # 33 shared UI components
│   │   ├── hooks/               # useAuth, useCountdown, useFeedbackPolling, useMediaRecorder
│   │   ├── store/               # Zustand stores (auth, interview, notification)
│   │   ├── lib/                 # Socket.IO client setup
│   │   └── App.jsx
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── Makefile
└── README.md
```

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
