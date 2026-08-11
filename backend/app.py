"""
VivaMate AI — Flask Backend (port 5000)
VTU-aware exam assistant with SQLite database
"""
import os
import sys

from flask import Flask, request
from flask_cors import CORS

sys.path.insert(0, os.path.dirname(__file__))
from ai_engine import ask_vivamate
from db import fetchone_db
from routes.syllabus import syllabus

app = Flask(__name__)
CORS(app)
app.register_blueprint(syllabus)


@app.route("/")
def home():
    return {"message": "Welcome to VivaMate AI Backend", "version": "3.1.0"}


@app.route("/api/dashboard")
def dashboard():
    return {
        "student": "Mohammed Saad",
        "semester": "3rd Semester",
        "branch": "Computer Science Engineering",
        "cgpa": 0,
        "studyHours": 0,
        "dayStreak": 0,
        "aiAnswers": 0,
    }


@app.route("/api/generate-answer", methods=["POST"])
def generate_answer():
    data = request.get_json()
    question = data.get("question", "")

    if not question.strip():
        return {"answer": "Please enter a question."}

    marks = data.get("marks", 5)
    subject_id = data.get("subject_id")

    answer = ask_vivamate(question, marks=marks, subject_id=subject_id)
    return {"answer": answer}


@app.route("/api/viva/generate-question", methods=["POST"])
def generate_viva_question():
    """Generate a viva question based on subject context."""
    data = request.get_json()
    subject_id = data.get("subject_id")
    topic = data.get("topic", "general")

    prompt = f"Generate one short viva interview question about {topic}. Return ONLY the question, nothing else."

    answer = ask_vivamate(prompt, marks=2, subject_id=subject_id)
    return {"question": answer}


@app.route("/api/viva/check-answer", methods=["POST"])
def check_viva_answer():
    """Evaluate a student's viva answer."""
    data = request.get_json()
    question = data.get("question", "")
    student_answer = data.get("answer", "")
    subject_id = data.get("subject_id")

    prompt = f"""You are an examiner. Evaluate this viva answer.
Question: {question}
Student's answer: {student_answer}

Respond in this EXACT format:
SCORE: X/10
FEEDBACK: One or two sentences explaining if correct and what to improve.
MISSING: Any key concepts the student missed."""

    result = ask_vivamate(prompt, marks=2, subject_id=subject_id)
    return {"evaluation": result}


@app.route("/api/quiz/generate", methods=["POST"])
def generate_quiz():
    """Generate quiz questions for a subject."""
    data = request.get_json()
    subject_id = data.get("subject_id")
    num_questions = data.get("num", 5)

    prompt = f"Generate {num_questions} multiple-choice quiz questions. For each: question, 4 options (A-D), and correct answer. Format as numbered list."

    result = ask_vivamate(prompt, marks=5, subject_id=subject_id)
    return {"quiz": result}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
