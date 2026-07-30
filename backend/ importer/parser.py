import re
from pathlib import Path

import fitz


BASE_DIR = Path(__file__).resolve().parents[1]
CACHE_DIR = BASE_DIR / "cache" / "vtu"


def extract_pdf_text(pdf_path, max_pages=8):
    """Extract text from the first few pages of a PDF."""

    document = fitz.open(pdf_path)

    text_parts = []

    pages = min(len(document), max_pages)

    for page_number in range(pages):
        page = document.load_page(page_number)
        text_parts.append(page.get_text())

    document.close()

    return "\n".join(text_parts)


def find_subject_codes(text):
    """
    Find likely VTU course codes.

    Examples:
    BCS301
    BCS302
    BEC301
    BME401
    1BMATCS301
    """

    patterns = [
        r"\b[A-Z]{2,5}\d{3}[A-Z]?\b",
        r"\b\d[A-Z]{3,6}\d{3}[A-Z]?\b",
    ]

    found = []

    for pattern in patterns:
        matches = re.findall(pattern, text)

        for match in matches:
            if match not in found:
                found.append(match)

    return found


def detect_semester(text, filename):
    combined = f"{filename}\n{text}".lower()

    if re.search(r"\bsemester\s*1\b|\b1st\s+semester\b", combined):
        return 1

    if re.search(r"\bsemester\s*2\b|\b2nd\s+semester\b", combined):
        return 2

    if re.search(r"\bsemester\s*3\b|\b3rd\s+semester\b", combined):
        return 3

    if re.search(r"\bsemester\s*4\b|\b4th\s+semester\b", combined):
        return 4

    if re.search(r"\bsemester\s*5\b|\b5th\s+semester\b", combined):
        return 5

    if re.search(r"\bsemester\s*6\b|\b6th\s+semester\b", combined):
        return 6

    if re.search(r"\bsemester\s*7\b|\b7th\s+semester\b", combined):
        return 7

    if re.search(r"\bsemester\s*8\b|\b8th\s+semester\b", combined):
        return 8

    # Some VTU filenames group semesters
    filename_lower = filename.lower()

    if "3-4" in filename_lower:
        return "3-4"

    if "5-8" in filename_lower:
        return "5-8"

    return None


def classify_document(filename, text):
    """Classify the document type."""

    combined = f"{filename}\n{text}".lower()

    if "circular" in combined:
        return "circular"

    if "manual" in combined:
        return "manual"

    if "scheme" in combined and "syllabus" not in combined:
        return "scheme"

    if "syllabus" in combined:
        return "syllabus"

    return "other"


def inspect_file(pdf_path):

    print("\n" + "=" * 80)
    print(f"FILE: {pdf_path.name}")
    print("=" * 80)

    try:

        text = extract_pdf_text(
            pdf_path,
            max_pages=8,
        )

        document_type = classify_document(
            pdf_path.name,
            text,
        )

        semester = detect_semester(
            text,
            pdf_path.name,
        )

        subject_codes = find_subject_codes(text)

        print(f"Type: {document_type}")
        print(f"Semester: {semester}")
        print(
            "Subject codes:",
            ", ".join(subject_codes[:20])
            if subject_codes
            else "None",
        )

        print("\n--- Extracted text preview ---\n")

        preview = text[:4000]

        print(preview)

    except Exception as error:

        print(
            f"ERROR: {error}"
        )


def run():

    print("=" * 80)
    print("           VivaMate VTU PDF Parser")
    print("=" * 80)

    pdf_files = sorted(
        CACHE_DIR.rglob("*.pdf")
    )

    print(
        f"Found {len(pdf_files)} PDF files."
    )

    # Only inspect a small sample first.
    sample_files = [
        path
        for path in pdf_files
        if (
            "cse" in path.name.lower()
            or "ece" in path.name.lower()
            or "aiml" in path.name.lower()
        )
    ]

    sample_files = sample_files[:10]

    print(
        f"Inspecting {len(sample_files)} representative files."
    )

    for pdf_path in sample_files:

        inspect_file(pdf_path)


if __name__ == "__main__":
    run()
