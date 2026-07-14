from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from backend.ai_engine import ask_vivamate


app = FastAPI(
    title="VivaMate AI API",
    description="Engineering exam assistant API",
    version="1.0.0"
)


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "VivaMate AI API is running"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):
    answer = ask_vivamate(request.question)

    return {
        "question": request.question,
        "answer": answer
    }
