# VivaMate AI Backend

The backend is a Flask API that powers VivaMate AI's AI-assisted study features.

## Setup

1. Create and activate a Python virtual environment:

   ```bash
   python -m venv .venv
   ```

   Windows:

   ```powershell
   .venv\Scripts\Activate.ps1
   ```

   macOS/Linux:

   ```bash
   source .venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Configure the environment:

   ```bash
   copy .env.example .env
   ```

   On macOS/Linux, use `cp .env.example .env` instead. Set `OPENROUTER_API_KEY` in `.env`.

4. Start the development server:

   ```bash
   python app.py
   ```

The API runs on `http://127.0.0.1:5000` by default.

## Health check

Open `http://127.0.0.1:5000/health`. A healthy server returns a JSON response indicating that the API is running.

## Production

Use the included `Procfile` with Gunicorn or an equivalent WSGI server. Keep the OpenRouter API key on the server and never expose it in frontend code.
