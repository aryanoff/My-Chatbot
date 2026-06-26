# Zaara AI

Premium AI chatbot platform powered by Meta AI (Groq), built with Next.js 15, React 19, FastAPI, and PostgreSQL.

## Architecture

```
Chatbot/
├── frontend/          # Next.js 15 + React 19 + Tailwind + Framer Motion
├── backend/           # FastAPI + Meta AI (Groq) + PostgreSQL
├── docker-compose.yml # Full stack orchestration
├── Dockerfile.frontend
├── Dockerfile.backend
└── railway.toml       # Railway deployment config
```

## Features

- Glassmorphism premium UI (ChatGPT + Claude + Perplexity inspired)
- Real-time streaming chat via WebSocket
- Multi-model support (GPT, Claude, Gemini, Grok, Meta AI)
- AI Agents, Projects, Library, Dashboard
- Voice chat UI, file uploads, markdown rendering
- Google / Email / GitHub authentication
- Dark / Light / System themes
- Responsive desktop + mobile layouts
- JWT auth, rate limiting, PostgreSQL persistence

## Quick Start

### Prerequisites

- Node.js 22+
- Python 3.12+
- PostgreSQL 16+
- Groq API key ([console.groq.com/keys](https://console.groq.com/keys))

### 1. Environment Setup

```bash
cp .env.example .env
# Edit .env with your GROQ_API_KEY and SECRET_KEY
```

### 2. Backend

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker (Full Stack)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Deployment

### Vercel (Frontend)

1. Connect repo to Vercel
2. Set root directory to `frontend`
3. Add env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`

### Railway (Backend)

1. Connect repo to Railway
2. Uses `Dockerfile.backend` and `railway.toml`
3. Add PostgreSQL plugin and set `DATABASE_URL`, `GROQ_API_KEY`, `SECRET_KEY`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/chats` | List chats |
| POST | `/api/v1/chats/{id}/messages` | Send message |
| WS | `/api/v1/chats/{id}/stream` | Stream response |
| POST | `/api/v1/files/upload` | Upload file |
| GET | `/api/v1/analytics/dashboard` | Analytics |
| GET | `/api/v1/agents` | List AI agents |

## Tech Stack

**Frontend:** React 19, Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI, Zustand, Recharts

**Backend:** Python, FastAPI, SQLAlchemy, Groq (Meta Llama), PostgreSQL, JWT, WebSocket

**Deploy:** Docker, Vercel, Railway

## License

MIT
