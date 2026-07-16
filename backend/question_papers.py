import re
import html
from urllib.parse import urljoin
from urllib.request import Request, urlopen

VTU_BASE = "https://vtu.ac.in/"
QUESTION_PAPER_PAGE = "https://vtu.ac.in/en/model-question-paper/"


def download_page(url):
    request = Request(
        url,
        headers={"User-Agent": "VivaMate-AI/1.0"},
    )

    with urlopen(request, timeout=30) as response:
        return response.read().decode(
            "utf-8",
            errors="ignore",
        )


def clean_text(text):
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def detect_scheme(url):
    url = url.lower()

    if (
        "2025" in url
        or "ug2024" in url
        or "2025syll" in url
    ):
        return "2025"

    if "2022" in url:
        return "2022"

    return "Unknown"


def detect_exam_type(title):

    t = title.lower()

    if "model" in t:
        return "Model"

    if "cie" in t:
        return "CIE"

    if "internal" in t:
        return "CIE"

    if "see" in t:
        return "SEE"

    return "Question Paper"


def detect_course_code(text):

    patterns = [
        r"1B[A-Z]{2,8}[0-9]{3}[A-Z]?",
        r"B[A-Z]{2,8}[0-9]{3}[A-Z]?",
    ]

    text = text.upper()

    for pattern in patterns:

        match = re.search(pattern, text)

        if match:
            return match.group(0)

    return None


def fetch_question_papers():

    html_page = download_page(QUESTION_PAPER_PAGE)

    pattern = re.compile(
        r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        re.I | re.S,
    )

    papers = []

    seen = set()

    for href, label_html in pattern.findall(html_page):

        url = urljoin(
            QUESTION_PAPER_PAGE,
            html.unescape(href),
        )

        if ".pdf" not in url.lower():
            continue

        title = clean_text(label_html)

        course_code = detect_course_code(
            title + " " + url
        )

        if course_code is None:
            continue

        if url in seen:
            continue

        seen.add(url)

        papers.append(
            {
                "course_code": course_code,
                "title": title,
                "scheme": detect_scheme(url),
                "exam_type": detect_exam_type(title),
                "url": url,
            }
        )

    return papers


def search_question_papers(
    query,
    scheme=None,
):

    query = query.lower()

    results = []

    for paper in fetch_question_papers():

        if scheme:

            if paper["scheme"] != scheme:
                continue

        if (
            query in paper["course_code"].lower()
            or query in paper["title"].lower()
        ):

            results.append(paper)

    return results


if __name__ == "__main__":

    papers = fetch_question_papers()

    print()

    print("Question Papers Found:", len(papers))

    print()

    for paper in papers[:100]:

        print(
            paper["course_code"],
            "|",
            paper["scheme"],
            "|",
            paper["exam_type"],
        )

        print(paper["title"])

        print(paper["url"])

        print()
