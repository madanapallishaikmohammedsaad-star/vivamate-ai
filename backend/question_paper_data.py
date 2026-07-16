from backend.question_papers import fetch_question_papers
from backend.academic_data import get_subject_by_code

_question_papers_cache = None


def get_question_papers():
    global _question_papers_cache

    if _question_papers_cache is None:
        papers = fetch_question_papers()

        for paper in papers:
            subject = get_subject_by_code(paper["course_code"])

            if subject:
                paper["scheme"] = subject["scheme"]

        _question_papers_cache = papers

    return _question_papers_cache


def get_papers(course_code, scheme=None):
    course_code = course_code.upper()

    results = []

    for paper in get_question_papers():

        if paper["course_code"] != course_code:
            continue

        if scheme and paper["scheme"] != scheme:
            continue

        results.append(paper)

    return results


def search_papers(query, scheme=None):
    query = query.lower()

    results = []

    for paper in get_question_papers():

        if scheme and paper["scheme"] != scheme:
            continue

        if (
            query in paper["course_code"].lower()
            or query in paper["title"].lower()
        ):
            results.append(paper)

    return results


def refresh_question_papers():
    global _question_papers_cache

    _question_papers_cache = fetch_question_papers()

    return {
        "message": "Question papers refreshed",
        "papers": len(_question_papers_cache),
    }
