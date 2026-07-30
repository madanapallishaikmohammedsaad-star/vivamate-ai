import json
import re
from pathlib import Path

import fitz


BASE_DIR = Path(__file__).resolve().parents[1]
CACHE_DIR = BASE_DIR / "cache" / "vtu"

OUTPUT_FILE = BASE_DIR / "cache" / "parsed_syllabus.json"
CHECKPOINT_FILE = BASE_DIR / "cache" / "extractor_checkpoint.json"


def normalize_text(text):
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf_text(pdf_path):
    document = fitz.open(pdf_path)

    pages = []

    for page in document:
        pages.append(page.get_text())

    document.close()

    return normalize_text("\n".join(pages))


def detect_scheme(pdf_path):
    parent = pdf_path.parent.name

    if parent in {"2022", "2025"}:
        return parent

    return None


def detect_semester(text, filename):
    combined = f"{filename}\n{text}".lower()

    semester_patterns = {
        1: [r"\bsemester\s+1\b", r"\b1st\s+semester\b"],
        2: [r"\bsemester\s+2\b", r"\b2nd\s+semester\b"],
        3: [r"\bsemester\s+3\b", r"\b3rd\s+semester\b"],
        4: [r"\bsemester\s+4\b", r"\b4th\s+semester\b"],
        5: [r"\bsemester\s+5\b", r"\b5th\s+semester\b"],
        6: [r"\bsemester\s+6\b", r"\b6th\s+semester\b"],
        7: [r"\bsemester\s+7\b", r"\b7th\s+semester\b"],
        8: [r"\bsemester\s+8\b", r"\b8th\s+semester\b"],
    }

    for semester, patterns in semester_patterns.items():
        for pattern in patterns:
            if re.search(pattern, combined):
                return semester

    filename_lower = filename.lower()

    ranges = [
        ("3-4", r"3[- ]4"),
        ("5-8", r"5[- ]8"),
        ("5-6", r"5[- ]6"),
        ("7-8", r"7[- ]8"),
        ("3-8", r"3[- ]8"),
    ]

    for value, pattern in ranges:
        if re.search(pattern, filename_lower):
            return value

    return None


def extract_course_codes(text):
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
    pattern = re.compile(
        r"(?P<title>.*?)"
        r"\n\s*Semester\s*\n"
        r"\s*(?:I{1,3}|IV|V|VI|VII|VIII|\d{1,2})\s*\n"
        r"\s*Course Code\s*\n"
        r"\s*(?:[A-Z]{2,6}\d{3}[A-Z]?|\d[A-Z]{3,6}\d{3}[A-Z]?)",
        re.IGNORECASE | re.DOTALL,
    )

    match = pattern.search(text)

    if match:
        lines = [
            line.strip()
            for line in match.group("title").splitlines()
            if line.strip()
        ]

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

    if course_code:
        index = text.find(course_code)

        if index != -1:
            lines = [
                line.strip()
                for line in text[:index].splitlines()[-10:]
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

    if not match:
        return None

    try:
        number = float(match.group(1))
        return int(number) if number.is_integer() else number
    except ValueError:
        return None


def extract_modules(text):
    pattern = re.compile(
        r"(?:^|\n)\s*"
        r"MODULE[\s\-]*([1-5])"
        r"\s*[:\-]?\s*([^\n]*)\n"
        r"(.*?)(?="
        r"\n\s*MODULE[\s\-]*[1-5]"
        r"\s*[:\-]?"
        r"|\Z)",
        re.IGNORECASE | re.DOTALL,
    )

    modules = {}

    for match in pattern.finditer(text):
        number = int(match.group(1))
        title = match.group(2).strip()
        content = match.group(3).strip()

        content = re.sub(r"\n{3,}", "\n\n", content)

        modules[number] = {
            "number": number,
            "title": title,
            "content": content,
        }

    return [
        modules[number]
        for number in sorted(modules)
    ]


def classify_document(pdf_path, text):
    combined = f"{pdf_path.name}\n{text[:12000]}".lower()

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


def extract_record(pdf_path):
    try:
        text = extract_pdf_text(pdf_path)

        if not text:
            return None

        document_type = classify_document(
            pdf_path,
            text,
        )

        if document_type not in {"scheme", "syllabus"}:
            return None

        scheme = detect_scheme(pdf_path)
        semester = detect_semester(text, pdf_path.name)
        course_code = extract_first_course_code(text)
        course_title = extract_course_title(text, course_code)
        credits = extract_credits(text)
        modules = extract_modules(text)

        return {
            "scheme": scheme,
            "source_file": str(
                pdf_path.relative_to(BASE_DIR)
            ),
            "document_type": document_type,
            "semester": semester,
            "course_code": course_code,
            "course_title": course_title,
            "credits": credits,
            "modules": modules,
        }

    except Exception as error:
        return {
            "source_file": str(
                pdf_path.relative_to(BASE_DIR)
            ),
            "error": str(error),
        }


def load_existing_records():
    if not OUTPUT_FILE.exists():
        return []

    try:
        return json.loads(
            OUTPUT_FILE.read_text(
                encoding="utf-8"
            )
        )
    except Exception:
        return []


def load_checkpoint():
    if not CHECKPOINT_FILE.exists():
        return 0

    try:
        data = json.loads(
            CHECKPOINT_FILE.read_text(
                encoding="utf-8"
            )
        )
        return int(data.get("last_index", 0))
    except Exception:
        return 0


def save_checkpoint(index):
    CHECKPOINT_FILE.write_text(
        json.dumps(
            {"last_index": index},
            indent=2,
        ),
        encoding="utf-8",
    )


def save_records(records):
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


def run():
    print("=" * 80)
    print("        VivaMate VTU Extractor (Resume Safe)")
    print("=" * 80)

    pdf_files = sorted(
        CACHE_DIR.rglob("*.pdf")
    )

    total = len(pdf_files)

    print(f"PDF files found: {total}")

    records = load_existing_records()
    start_index = load_checkpoint()

    print(
        f"Existing records: {len(records)}"
    )

    print(
        f"Resuming from file #{start_index + 1}"
    )

    for index in range(
        start_index,
        total,
    ):

        pdf_path = pdf_files[index]

        print(
            f"[{index + 1}/{total}] "
            f"{pdf_path.name}"
        )

        record = extract_record(pdf_path)

        if record is not None:
            records.append(record)

        # Save every 5 files.
        if (
            (index + 1) % 5 == 0
            or index + 1 == total
        ):
            save_records(records)
            save_checkpoint(index + 1)

            print(
                f"Checkpoint saved: "
                f"{index + 1}/{total}"
            )

    save_records(records)
    save_checkpoint(total)

    print("\n" + "=" * 80)
    print("Extraction completed.")
    print(f"Records: {len(records)}")
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 80)


if __name__ == "__main__":
    run()
