from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from backend.ai_engine import ask_vivamate
from backend.academic_data import (
    get_schemes,
    get_branches,
    get_semesters,
    get_subjects,
    search_subjects,
)
from backend.vtu_updates import (
    get_update_categories,
    get_updates,
    search_updates,
)


app = FastAPI(
    title="VivaMate AI API",
    description="VTU Engineering Student Assistant API",
    version="2.0.0",
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
    subject: str = "General Engineering"


@app.get("/")
def home():
    return {
        "message": "VivaMate AI API is running",
        "version": "2.0.0",
    }


@app.get("/schemes")
def schemes():
    return {
        "schemes": get_schemes()
    }


@app.get("/branches/{scheme}")
def branches(scheme: str):
    return {
        "scheme": scheme,
        "branches": get_branches(scheme),
    }


@app.get("/semesters/{scheme}/{branch}")
def semesters(scheme: str, branch: str):
    return {
        "scheme": scheme,
        "branch": branch,
        "semesters": get_semesters(
            scheme,
            branch,
        ),
    }


@app.get("/subjects/{scheme}/{branch}/{semester}")
def subjects(
    scheme: str,
    branch: str,
    semester: str,
):
    return {
        "scheme": scheme,
        "branch": branch,
        "semester": semester,
        "subjects": get_subjects(
            scheme,
            branch,
            semester,
        ),
    }


@app.get("/subjects/search/")
def subject_search(
    query: str,
    scheme: str | None = None,
):
    return {
        "query": query,
        "results": search_subjects(
            query,
            scheme,
        ),
    }


@app.get("/updates/categories")
def update_categories():
    return {
        "categories": get_update_categories()
    }


@app.get("/updates")
def updates(category: str | None = None):
    return {
        "updates": get_updates(category)
    }


@app.get("/updates/search/")
def update_search(query: str):
    return {
        "query": query,
        "results": search_updates(query),
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):

    exam_question = f"""
You are VivaMate AI, a VTU engineering exam answer assistant.

Subject:
{request.subject}

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
- Focus on the selected subject.
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
        "subject": request.subject,
        "answer": answer,
    }
