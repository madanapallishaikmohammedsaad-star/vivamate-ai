"""
VivaMate AI — Flask Backend
VTU-aware exam assistant with SQLite database
"""
import os
import sys

from flask import Flask, request, jsonify
from flask_cors import CORS

sys.path.insert(0, os.path.dirname(__file__))
from ai_engine import ask_vivamate
from routes.syllabus import syllabus

app = Flask(__name__)
CORS(app)
app.register_blueprint(syllabus)


@app.get("/")
def home():
    return {"message": "Welcome to VivaMate AI Backend", "version": "3.1.1"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "vivamate-backend"}


@app.get("/api/dashboard")
def dashboard():
    # Temporary demo response until user accounts and progress persistence are added.
    return {
        "student": "Mohammed Saad",
        "semester": "3rd Semester",
        "branch": "Computer Science Engineering",
        "cgpa": 0,
        "studyHours": 0,
        "dayStreak": 0,
        "aiAnswers": 0,
    }


def _json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, (jsonify({"error": "Request body must be a JSON object."}), 400)
    return data, None


def _api_key():
    # Keep the OpenRouter secret on the server.
    return os.getenv("OPENROUTER_API_KEY")


@app.post("/api/generate-answer")
def generate_answer():
    data, error = _json_body()
    if error:
        return error

    question = str(data.get("question", "")).strip()
    if not question:
        return jsonify({"error": "Please enter a question."}), 400
    if len(question) > 10000:
        return jsonify({"error": "Question is too long. Maximum length is 10,000 characters."}), 400

    try:
        marks = int(data.get("marks", 5))
    except (TypeError, ValueError):
        return jsonify({"error": "Marks must be a number."}), 400
    if marks not in (2, 5, 10, 15):
        return jsonify({"error": "Marks must be one of: 2, 5, 10, or 15."}), 400

    answer = ask_vivamate(question, marks=marks, subject_id=data.get("subject_id"), api_key=_api_key())
    return jsonify({"answer": answer})


@app.post("/api/viva/generate-question")
def generate_viva_question():
    data, error = _json_body()
    if error:
        return error

    topic = str(data.get("topic", "general")).strip()[:500] or "general"
    prompt = f"Generate one short viva interview question about {topic}. Return ONLY the question, nothing else."
    answer = ask_vivamate(prompt, marks=2, subject_id=data.get("subject_id"), api_key=_api_key())
    return jsonify({"question": answer})


@app.post("/api/viva/check-answer")
def check_viva_answer():
    data, error = _json_body()
    if error:
        return error

    question = str(data.get("question", "")).strip()
    student_answer = str(data.get("answer", "")).strip()
    if not question or not student_answer:
        return jsonify({"error": "Both question and answer are required."}), 400
    if len(student_answer) > 10000:
        return jsonify({"error": "Answer is too long. Maximum length is 10,000 characters."}), 400

    prompt = f"""You are an examiner. Evaluate this viva answer.
Question: {question}
Student's answer: {student_answer}

Respond in this EXACT format:
SCORE: X/10
FEEDBACK: One or two sentences explaining if correct and what to improve.
MISSING: Any key concepts the student missed."""
    result = ask_vivamate(prompt, marks=2, subject_id=data.get("subject_id"), api_key=_api_key())
    return jsonify({"evaluation": result})


@app.post("/api/quiz/generate")
def generate_quiz():
    data, error = _json_body()
    if error:
        return error

    try:
        num_questions = int(data.get("num", 5))
    except (TypeError, ValueError):
        return jsonify({"error": "num must be a number."}), 400
    if not 1 <= num_questions <= 20:
        return jsonify({"error": "num must be between 1 and 20."}), 400

    prompt = (
        f"Generate {num_questions} multiple-choice quiz questions. "
        "For each: question, 4 options (A-D), and correct answer. Format as numbered list."
    )
    result = ask_vivamate(prompt, marks=5, subject_id=data.get("subject_id"), api_key=_api_key())
    return jsonify({"quiz": result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
