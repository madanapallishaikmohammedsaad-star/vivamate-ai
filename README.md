# VivaMate AI

VivaMate AI is an AI-powered study companion for students. It provides syllabus-based answers, mock viva practice, quizzes, and progress tracking through a React frontend and Flask backend.

## Project structure

- `frontend/` — React + Vite application
- `backend/` — Flask API, SQLite data layer, and OpenRouter AI integration

## Local setup

### 1. Backend

```bash
cd backend
python -m venv .venv
```

Activate the environment:

- Windows: `.venv\\Scripts\\activate`
- macOS/Linux: `source .venv/bin/activate`

Install dependencies and configure the API key:

```bash
pip install -r requirements.txt
copy .env.example .env
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Set `OPENROUTER_API_KEY` in `backend/.env`. Keep this key on the server; never place it in frontend code or commit it to Git.

Start the API:

```bash
python app.py
```

The backend runs on `http://localhost:5000` by default.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

If the backend is hosted somewhere else, create `frontend/.env` with:

```env
VITE_API_BASE_URL=https://your-backend-domain.example.com
```

## Production build

```bash
cd frontend
npm run build
```

The generated production files are placed in `frontend/dist`.

## Security notes

- Store `OPENROUTER_API_KEY` only in the backend environment.
- Do not commit `.env` files, API keys, or private credentials.
- Use HTTPS when deploying the frontend and backend publicly.
- Configure the backend CORS policy for the domains you actually deploy.

## Current features

- Syllabus, branch, semester, and subject selection
- AI-generated exam answers with mark-based length guidance
- Interactive mock viva sessions with answer evaluation
- AI-generated multiple-choice quizzes with scoring and explanations
- Dashboard progress and study statistics
- Theme and notification preferences
- Health endpoint at `/health`
