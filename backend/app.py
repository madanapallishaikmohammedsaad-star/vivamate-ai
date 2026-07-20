from routes.syllabus import syllabus
from flask import Flask, request
from ai_engine import ask_vivamate
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {
        "message": "Welcome to VivaMate AI Backend"
    }

@app.route("/api/dashboard")
def dashboard():
    return {
        "student": "Saad",
        "semester": "2nd Semester",
        "cgpa": 8.4,
        "studyHours": 32,
        "dayStreak": 14,
        "aiAnswers": 185
    }
@app.route("/api/generate-answer", methods=["POST"])
def generate_answer():

    data = request.get_json()

    question = data.get("question", "")

    if not question.strip():
        return {
            "answer": "Please enter a question."
        }

    answer = ask_vivamate(question)

    return {
        "answer": answer
    }
    answer = ask_vivamate(question)

    return {
        "answer": answer
    }
app.register_blueprint(syllabus)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
