import re
import html
from urllib.parse import urljoin
from urllib.request import Request, urlopen


VTU_SYLLABUS_URL = (
    "https://vtu.ac.in/en/b-e-scheme-syllabus/"
)


def download_vtu_page():
    request = Request(
        VTU_SYLLABUS_URL,
        headers={"User-Agent": "VivaMate-AI/1.0"},
    )

    with urlopen(request, timeout=30) as response:
        return response.read().decode(
            "utf-8",
            errors="ignore",
        )


def clean_text(value):
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def extract_pdf_links(page_html):
    link_pattern = re.compile(
        r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        re.IGNORECASE | re.DOTALL,
    )

    links = []
    seen = set()

    for href, label_html in link_pattern.findall(page_html):
        url = html.unescape(
            urljoin(VTU_SYLLABUS_URL, href)
        )

        label = clean_text(label_html)

        if not url.lower().endswith(".pdf"):
            continue

        if "vtu.ac.in" not in url.lower():
            continue

        if url in seen:
            continue

        seen.add(url)

        links.append({
            "title": label,
            "filename": url.split("/")[-1],
            "url": url,
        })

    return links


def detect_scheme(url):
    url_lower = url.lower()

    if (
        "2025syll" in url_lower
        or "2025commsyll" in url_lower
        or "ug2024" in url_lower
    ):
        return "2025"

    if "2022syll" in url_lower:
        return "2022"

    return None


def detect_course_code(filename):
    filename = filename.upper()

    filename = re.sub(
        r"\.PDF$",
        "",
        filename,
    )

    filename = re.sub(
        r"^BS",
        "",
        filename,
    )

    patterns = [
        r"\b1B[A-Z]{2,8}[0-9]{3}[A-Z]?\b",
        r"\bB[A-Z]{2,8}[0-9]{3}[A-Z]?\b",
    ]

    for pattern in patterns:
        match = re.search(pattern, filename)

        if match:
            return match.group(0)

    return None


def is_engineering_course(course_code):
    excluded_prefixes = (
        "BCA",
        "BBA",
        "MBA",
        "MCA",
        "MTECH",
    )

    return not course_code.startswith(
        excluded_prefixes
    )


def fetch_course_documents():
    page_html = download_vtu_page()
    pdf_links = extract_pdf_links(page_html)

    course_documents = []

    for link in pdf_links:
        scheme = detect_scheme(link["url"])

        if scheme is None:
            continue

        course_code = detect_course_code(
            link["filename"]
        )

        if course_code is None:
            continue

        if not is_engineering_course(course_code):
            continue

        course_documents.append({
            "scheme": scheme,
            "course_code": course_code,
            "title": link["title"],
            "filename": link["filename"],
            "url": link["url"],
        })

    return course_documents


if __name__ == "__main__":
    documents = fetch_course_documents()

    print(
        "VTU B.E./B.Tech course documents found:",
        len(documents),
    )

    print()

    scheme_counts = {}

    for document in documents:
        scheme = document["scheme"]

        scheme_counts[scheme] = (
            scheme_counts.get(scheme, 0) + 1
        )

    print("Scheme counts:", scheme_counts)
    print()

    for index, document in enumerate(
        documents[:100],
        start=1,
    ):
        print(
            f'{index}. '
            f'[{document["scheme"]}] '
            f'{document["course_code"]} '
            f'- {document["title"]}'
        )

        print(document["url"])
        print()
