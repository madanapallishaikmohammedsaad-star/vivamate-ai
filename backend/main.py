from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from backend.ai_engine import ask_vivamate


app = FastAPI(
    title="VivaMate AI API",
    description="Engineering exam assistant API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    marks: int = 5


@app.get("/")
def home():
    return {
        "message": "VivaMate AI API is running"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):

    exam_question = f"""
You are VivaMate AI, a VTU engineering exam answer assistant.

Generate a clean, accurate, exam-ready answer for exactly {request.marks} marks.

STRICT RULES:
- Write only in clear English.
- Never output random foreign characters.
- Check every sentence for broken or meaningless words.
- Do not mention mark allocation inside individual sections.
- Do not write labels such as "(2 marks)" or "(1 mark)".
- Keep the total answer length suitable for {request.marks} marks.
- Use standard engineering terminology.
- Use simple language suitable for university exams.
- Do not add irrelevant advanced information.

ANSWER LENGTH:

2 marks:
Maximum 2 to 3 short sentences.
Give definition and one important point only.

5 marks:
Give definition, working or explanation, important equations, and key points.
Keep the answer concise.

10 marks:
Give a detailed structured answer.
Include definition, principle, working, equations, advantages, disadvantages, and applications when relevant.

Before responding, silently proofread the complete answer and remove corrupted words, random characters, and formatting errors.

Question:
{request.question}
"""

    answer = ask_vivamate(exam_question)

    return {
        "question": request.question,
        "marks": request.marks,
        "answer": answer
    }
