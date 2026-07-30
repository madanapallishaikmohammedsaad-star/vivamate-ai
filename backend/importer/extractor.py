import json
import re
from pathlib import Path

import fitz


BASE_DIR = Path(__file__).resolve().parents[1]
CACHE_DIR = BASE_DIR / "cache" / "vtu"
OUTPUT_FILE = BASE_DIR / "cache" / "parsed_syllabus.json"


def normalize_text(text):
    """Clean PDF text while preserving useful line structure."""
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf_text(pdf_path):
    """Extract all text from a PDF."""
    document = fitz.open(pdf_path)

    pages = []

    for page in document:
        pages.append(page.get_text())

    document.close()

    return normalize_text("\n".join(pages))


def detect_scheme(pdf_path):
    """Scheme comes from the cache folder: 2022 or 2025."""
    parent = pdf_path.parent.name

    if parent in {"2022", "2025"}:
        return parent

    return None


def detect_semester(text, filename):
    """Detect a single semester or a semester range."""
    combined = f"{filename}\n{text}".lower()

    # Exact semester statements
    patterns = [
        (1, r"\bsemester\s+1\b|\b1st\s+semester\b"),
        (2, r"\bsemester\s+2\b|\b2nd\s+semester\b"),
        (3, r"\bsemester\s+3\b|\b3rd\s+semester\b"),
        (4, r"\bsemester\s+4\b|\b4th\s+semester\b"),
        (5, r"\bsemester\s+5\b|\b5th\s+semester\b"),
        (6, r"\bsemester\s+6\b|\b6th\s+semester\b"),
        (7, r"\bsemester\s+7\b|\b7th\s+semester\b"),
        (8, r"\bsemester\s+8\b|\b8th\s+semester\b"),
    ]

    for semester, pattern in patterns:
        if re.search(pattern, combined, re.IGNORECASE):
            return semester

    # Common VTU filename ranges
    filename_lower = filename.lower()

    range_patterns = [
        ("3-4", r"3[- ]4"),
        ("5-8", r"5[- ]8"),
        ("5-6", r"5[- ]6"),
        ("7-8", r"7[- ]8"),
        ("3-8", r"3[- ]8"),
    ]

    for value, pattern in range_patterns:
        if re.search(pattern, filename_lower):
            return value

    # Roman numerals in some documents
    roman = {
        " i ": 1,
        " ii ": 2,
        " iii ": 3,
        " iv ": 4,
        " v ": 5,
        " vi ": 6,
        " vii ": 7,
        " viii ": 8,
    }

    padded = f" {combined} "

    for token, value in roman.items():
        if f"semester{token}" in padded:
            return value

    return None


def extract_course_codes(text):
    """Extract likely VTU course codes."""
    patterns = [
        r"\b[A-Z]{2,6}\d{3}[A-Z]?\b",
        r"\b\d[A-Z]{3,6}\d{3}[A-Z]?\b",
    ]

    found = []

    for pattern in patterns:
        for match in re.findall(pattern, text):
            if match not in found:
                found.append(match)

    return found


def extract_first_course_code(text):
    codes = extract_course_codes(text)
    return codes[0] if codes else None


def extract_course_title(text, course_code=None):
    """
    Try to find the course title immediately before
    the first Semester/Course Code block.

    Example:

    Mathematics for Computer Science
    Semester
    3
    Course Code
    BCS301
    """

    pattern = re.compile(
        r"(?P<title>.*?)"
        r"\n\s*Semester\s*\n"
        r"\s*(?:I{1,3}|IV|V|VI|VII|VIII|\d{1,2})\s*\n"
        r"\s*Course Code\s*\n"
        r"\s*(?:"
        r"[A-Z]{2,6}\d{3}[A-Z]?|"
        r"\d[A-Z]{3,6}\d{3}[A-Z]?"
        r")",
        re.IGNORECASE | re.DOTALL,
    )

    match = pattern.search(text)

    if match:
        title = match.group("title").strip()

        # Keep only the last few lines before Semester.
        lines = [
            line.strip()
            for line in title.splitlines()
            if line.strip()
        ]

        if lines:
            # Remove obvious document headers.
            ignored = {
                "ANNEXURE-II",
                "ANNEXURE-III",
                "ANNEXURE II",
                "ANNEXURE III",
            }

            candidates = [
                line
                for line in lines[-8:]
                if line.upper() not in ignored
            ]

            if candidates:
                return candidates[-1]

    # Fallback: try text immediately before the course code.
    if course_code:
        index = text.find(course_code)

        if index != -1:
            before = text[:index].splitlines()

            lines = [
                line.strip()
                for line in before[-10:]
                if line.strip()
            ]

            if lines:
                return lines[-1]

    return None


def extract_credits(text):
    match = re.search(
        r"\bCredits\b\s*(?:\n|\s)+(\d+(?:\.\d+)?)",
        text,
        re.IGNORECASE,
    )

    if match:
        value = match.group(1)

        try:
            number = float(value)

            return int(number) if number.is_integer() else number

        except ValueError:
            pass

    return None


def extract_modules(text):
    """
    Extract Module-1 through Module-5.

    The parser stops each module at the next Module heading.
    """

    pattern = re.compile(
        r"(?:^|\n)\s*"
        r"(MODULE|Module)"
        r"[\s\-]*"
        r"([1-5])"
        r"\s*"
        r"[:\-]?\s*"
        r"([^\n]*)\n"
        r"(.*?)(?="
        r"\n\s*(?:MODULE|Module)[\s\-]*[1-5]"
        r"\s*[:\-]?"
        r"|\Z)",
        re.IGNORECASE | re.DOTALL,
    )

    modules = []

    for match in pattern.finditer(text):
        number = int(match.group(2))
        title = match.group(3).strip()
        content = match.group(4).strip()

        # Remove excessive whitespace.
        content = re.sub(r"\n{3,}", "\n\n", content)

        modules.append(
            {
                "number": number,
                "title": title,
                "content": content,
            }
        )

    # Make sure modules are unique and ordered.
    unique = {}

    for module in modules:
        unique[module["number"]] = module

    return [
        unique[number]
        for number in sorted(unique)
    ]


def classify_document(pdf_path, text):
    combined = (
        f"{pdf_path.name}\n{text[:12000]}"
    ).lower()

    if "circular" in combined:
        return "circular"

    if "manual" in combined:
        return "manual"

    if (
        "scheme of teaching and examinations" in combined
        or (
            "course title" in combined
            and "course code" in combined
        )
    ):
        return "scheme"

    if "syllabus" in combined:
        return "syllabus"

    return "other"


def should_process(pdf_path, text):
    """Only process documents that look useful for syllabus extraction."""
    document_type = classify_document(
        pdf_path,
        text,
    )

    return document_type in {
        "scheme",
        "syllabus",
    }


def extract_record(pdf_path):
    try:
        text = extract_pdf_text(pdf_path)

        if not text:
            return None

        if not should_process(pdf_path, text):
            return None

        scheme = detect_scheme(pdf_path)

        semester = detect_semester(
            text,
            pdf_path.name,
        )

        course_code = extract_first_course_code(text)

        course_title = extract_course_title(
            text,
            course_code,
        )

        credits = extract_credits(text)

        modules = extract_modules(text)

        return {
            "scheme": scheme,
            "source_file": str(
                pdf_path.relative_to(BASE_DIR)
            ),
            "document_type": classify_document(
                pdf_path,
                text,
            ),
            "semester": semester,
            "course_code": course_code,
            "course_title": course_title,
            "credits": credits,
            "modules": modules,
        }

    except Exception as error:

        return {
            "scheme": detect_scheme(pdf_path),
            "source_file": str(
                pdf_path.relative_to(BASE_DIR)
            ),
            "error": str(error),
        }


def run():
    print("=" * 80)
    print("             VivaMate VTU Extractor")
    print("=" * 80)

    pdf_files = sorted(
        CACHE_DIR.rglob("*.pdf")
    )

    print(
        f"PDF files found: {len(pdf_files)}"
    )

    records = []
    errors = 0

    for index, pdf_path in enumerate(
        pdf_files,
        start=1,
    ):

        print(
            f"[{index}/{len(pdf_files)}] "
            f"{pdf_path.name}"
        )

        record = extract_record(
            pdf_path
        )

        if record is None:
            continue

        if "error" in record:
            errors += 1

        records.append(record)

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_FILE.write_text(
        json.dumps(
            records,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print("\n" + "=" * 80)
    print("Extraction completed.")
    print(f"Records: {len(records)}")
    print(f"Errors: {errors}")
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 80)


if __name__ == "__main__":
    run()
