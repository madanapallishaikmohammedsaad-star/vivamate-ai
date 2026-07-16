from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from backend.ai_engine import ask_vivamate
from backend.academic_data import (
    get_schemes,
    get_subjects,
    get_subject_by_code,
    search_subjects,
    get_subject_documents,
    refresh_academic_data,
)
from backend.vtu_updates import (
    get_update_categories,
    get_updates,
    search_updates,
)


from backend.question_paper_data import (
    get_papers,
    search_papers,
    refresh_question_papers,
)

app = FastAPI(
    title="VivaMate AI API",
    description="VTU Engineering Student Assistant API",
    version="3.0.0",
)

STATIC_DIR = Path(__file__).parent / "static"

app.mount(
    "/static",
    StaticFiles(directory=STATIC_DIR),
    name="static",
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


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(STATIC_DIR / "index.html")

@app.get("/api")
def api_status():
    return {
        "message": "VivaMate AI API is running",
        "version": "3.0.0",
        "source": "Official VTU academic documents",
    }

@app.get("/schemes")
def schemes():
    return {
        "schemes": get_schemes()
    }


@app.get("/subjects")
def subjects(
    scheme: str | None = None,
    search: str | None = None,
):
    return {
        "scheme": scheme,
        "search": search,
        "subjects": get_subjects(
            scheme=scheme,
            search=search,
        ),
    }


@app.get("/subjects/search/")
def subject_search(
    query: str,
    scheme: str | None = None,
):
    return {
        "query": query,
        "scheme": scheme,
        "results": search_subjects(
            query=query,
            scheme=scheme,
        ),
    }


@app.get("/subjects/{course_code}")
def subject_details(
    course_code: str,
    scheme: str | None = None,
):
    subject = get_subject_by_code(
        course_code=course_code,
        scheme=scheme,
    )

    if subject is None:
        return {
            "message": "Subject not found",
            "course_code": course_code,
        }

    return subject


@app.get("/subjects/{course_code}/documents")
def subject_documents(
    course_code: str,
    scheme: str | None = None,
):
    return {
        "course_code": course_code,
        "scheme": scheme,
        "documents": get_subject_documents(
            course_code=course_code,
            scheme=scheme,
        ),
    }


@app.post("/academic/refresh")
def academic_refresh():
    return refresh_academic_data()
@app.get("/subjects/{course_code}/papers")
def subject_papers(
    course_code: str,
    scheme: str | None = None,
):
    return {
        "course_code": course_code,
        "scheme": scheme,
        "papers": get_papers(
            course_code=course_code,
            scheme=scheme,
        ),
    }


@app.get("/papers/search/")
def paper_search(
    query: str,
    scheme: str | None = None,
):
    return {
        "query": query,
        "scheme": scheme,
        "results": search_papers(
            query=query,
            scheme=scheme,
        ),
    }


@app.post("/papers/refresh")
def papers_refresh():
    return refresh_question_papers()

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
