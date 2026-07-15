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
        headers={
            "User-Agent": "VivaMate-AI/1.0"
        },
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
        url = urljoin(VTU_SYLLABUS_URL, href)
        label = clean_text(label_html)

        clean_url = html.unescape(url)

        if not clean_url.lower().endswith(".pdf"):
            continue

        if "vtu.ac.in" not in clean_url.lower():
            continue

        if clean_url in seen:
            continue

        seen.add(clean_url)

        filename = clean_url.split("/")[-1]

        links.append({
            "title": label,
            "filename": filename,
            "url": clean_url,
        })

    return links


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

    pattern = re.compile(
        r"\b(?:1)?B[A-Z]{2,8}[0-9]{3}[A-Z]?\b"
    )

    match = pattern.search(filename)

    if match:
        return match.group(0)

    return None


def fetch_course_documents():
    page_html = download_vtu_page()
    pdf_links = extract_pdf_links(page_html)

    course_documents = []

    for link in pdf_links:
        course_code = detect_course_code(
            link["filename"]
        )

        if course_code:
            course_documents.append({
                "course_code": course_code,
                "title": link["title"],
                "filename": link["filename"],
                "url": link["url"],
            })

    return course_documents


if __name__ == "__main__":
    documents = fetch_course_documents()

    print(
        "VTU course documents found:",
        len(documents),
    )

    print()

    for index, document in enumerate(
        documents[:100],
        start=1,
    ):
        print(
            f'{index}. '
            f'{document["course_code"]} '
            f'- {document["title"]}'
        )

        print(
            f'   {document["url"]}'
        )

        print()
