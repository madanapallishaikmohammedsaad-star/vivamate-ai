#!/usr/bin/env python3
"""
VivaMate VTU Auto-Importer v2 — downloads & parses ALL official VTU scheme PDFs
Source: https://vtu.ac.in/pdf/2022_3to8/ (2022 scheme, semesters 3-8)
Branch is passed explicitly per PDF (reliable), modules fully extracted.
"""
import re
import sqlite3
import sys
import urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
CACHE_DIR = BASE_DIR / "cache" / "vtu_official"
DB_PATH = BASE_DIR / "database" / "syllabus.db"
VTU_URL = "https://vtu.ac.in/pdf/2022_3to8"

HEADERS = {"User-Agent": "Mozilla/5.0 (VivaMate AI - Student Project)"}

# All official VTU 2022 scheme branch PDFs (verified filenames from vtu.ac.in)
BRANCH_PDFS = {
    "CSE": "2cseaimlsyll.pdf",
    "ECE": "2ecesyll.pdf",
    "EEE": "2eesyll.pdf",
    "ME": "mecsch.pdf",
    "CE": "2civsyll.pdf",
    "ISE": "2issesyll.pdf",
    "AIML": "2aimlsyll.pdf",
    "AERO": "2aerosyll.pdf",
    "AUTO": "2autosyll.pdf",
    "CHEM": "2chemsyll.pdf",
    "CSBS": "2csbssyll.pdf",
    "IOT": "2iotsyll.pdf",
    "AI": "2aisyll.pdf",
    "DS": "2dsssyll.pdf",
    "CYBER": "2cyberssyll.pdf",
    "MARINE": "2marinesyll.pdf",
    "AGRI": "2agrisyll.pdf",
    "BIOMED": "2biomedsyll.pdf",
    "ROBOTICS": "robosch.pdf",
    "VLSI": "vlsisch.pdf",
    "TEXTILE": "textsch.pdf",
    "MINING": "miningsch.pdf",
    "IEM": "iemsch.pdf",
}

BRANCH_NAMES = {
    "CSE": "Computer Science and Engineering",
    "ECE": "Electronics and Communication Engineering",
    "EEE": "Electrical and Electronics Engineering",
    "ME": "Mechanical Engineering",
    "CE": "Civil Engineering",
    "ISE": "Information Science and Engineering",
    "AIML": "Artificial Intelligence and Machine Learning",
    "AERO": "Aerospace Engineering",
    "AUTO": "Automobile Engineering",
    "CHEM": "Chemical Engineering",
    "CSBS": "Computer Science and Business Systems",
    "IOT": "Internet of Things",
    "AI": "Artificial Intelligence",
    "DS": "Data Science",
    "CYBER": "Cyber Security",
    "MARINE": "Marine Engineering",
    "AGRI": "Agricultural Engineering",
    "BIOMED": "Biomedical Engineering",
    "ROBOTICS": "Robotics and Automation",
    "VLSI": "VLSI Design and Embedded Systems",
    "TEXTILE": "Textile Engineering",
    "MINING": "Mining Engineering",
    "IEM": "Industrial Engineering and Management",
    "MATH": "Mathematics",
    "PHYS": "Physics",
    "HSS": "Humanities & Social Sciences",
}

# Subject code prefix → branch (for fallback + shared subjects)
BRANCH_PREFIXES = {
    "BCS": "CSE", "BCSD": "CSE", "BXX": "CSE",
    "BEC": "ECE", "BECE": "ECE",
    "BEE": "EEE",
    "BME": "ME", "BMED": "ME",
    "BCE": "CE",
    "BIS": "ISE",
    "BAI": "AIML",
    "BIOT": "BIOTECH",
    "BCH": "CHEM",
    "BAERO": "AERO",
    "BAUT": "AUTO",
    "BCYB": "CYBER",
    "BDS": "DS",
    "BIC": "IOT",
    "BMAT": "MATH", "BPHY": "PHYS", "BCHE": "CHEM", "BHS": "HSS",
    "BENG": "CSE", "BESCK": "CSE", "BETCK": "CSE",
    "BSFHK": "HSS", "BWR": "HSS", "BKS": "HSS",
}


def download_pdf(branch, filename):
    url = f"{VTU_URL}/{filename}"
    dest = CACHE_DIR / filename
    if dest.exists() and dest.stat().st_size > 1000:
        print(f"  ✓ {branch}: already downloaded")
        return str(dest)
    print(f"  ⬇ {branch}: {filename}...")
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
        dest.write_bytes(data)
        print(f"  ✓ {branch}: {len(data)/1024:.0f} KB")
        return str(dest)
    except Exception as e:
        print(f"  ✗ {branch}: {e}")
        return None


def detect_branch_from_code(code):
    if not code:
        return None
    code = code.upper()
    for prefix in sorted(BRANCH_PREFIXES, key=len, reverse=True):
        if code.startswith(prefix):
            return BRANCH_PREFIXES[prefix]
    return None


def parse_pdf_subjects(pdf_path, default_branch):
    """Parse a VTU scheme PDF into subject records."""
    try:
        import pymupdf
        doc = pymupdf.open(pdf_path)
    except ImportError:
        try:
            import fitz as pymupdf
            doc = pymupdf.open(pdf_path)
        except ImportError:
            print("  ✗ pymupdf not installed. Run: pip install pymupdf")
            return []

    subjects = []
    current = None
    code_pattern = re.compile(r"^[A-Z]{2,6}\d{2,4}[A-Z]?$")

    for page_num in range(doc.page_count):
        text = doc[page_num].get_text()
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        for idx, line in enumerate(lines):
            # === Detect "Course Code" line, code on NEXT line ===
            if re.match(r"^Course Code\s*$", line, re.I) or re.match(r"^Course Code:$", line, re.I):
                code = None
                if idx + 1 < len(lines):
                    candidate = lines[idx + 1].upper()
                    if code_pattern.match(candidate):
                        code = candidate
                if not code:
                    continue
                if current and current["course_code"]:
                    subjects.append(current)
                # Extract title: look backwards for a title line
                title = None
                for j in range(idx - 1, max(idx - 6, -1), -1):
                    cand = lines[j].strip()
                    if (len(cand) > 4 and not re.match(r"^(Semester|CIE|SEE|Credits|Teaching|Total|Exam|Examination|Annexure|\d+)$", cand, re.I)
                        and not re.match(r"^\d+$", cand)):
                        title = cand
                        break
                # Find Semester: it appears BEFORE "Course Code" in the PDF layout
                # Pattern: "Semester" line followed by the number line
                semester = None
                for j in range(idx - 1, max(idx - 8, -1), -1):
                    if re.match(r"^Semester\s*$", lines[j], re.I) and j + 1 < len(lines):
                        sm = re.match(r"^(\d+)$", lines[j + 1])
                        if sm:
                            semester = int(sm.group(1))
                            break
                current = {
                    "scheme": "2022",
                    "branch": detect_branch_from_code(code) or default_branch,
                    "course_code": code,
                    "course_title": title or code,
                    "semester": semester,
                    "credits": None,
                    "modules": [],
                }
                # Credits appear AFTER "Course Code" — scan forward
                for j in range(idx + 1, min(idx + 14, len(lines))):
                    if re.match(r"^Credits\s*$", lines[j], re.I) and j + 1 < len(lines):
                        cm = re.match(r"^(\d+)$", lines[j + 1])
                        if cm:
                            current["credits"] = int(cm.group(1))
                            break
                continue

            # === Module detection ===
            if current:
                mod_match = re.match(r"^Module[-\s:]*(\d+)[:\s]*(.*)$", line, re.I)
                if mod_match:
                    current["modules"].append({
                        "number": int(mod_match.group(1)),
                        "title": mod_match.group(2).strip() or f"Module {mod_match.group(1)}",
                        "content": "",
                    })
                elif current["modules"] and len(current["modules"]) > 0:
                    last = current["modules"][-1]
                    if len(last["content"]) < 3000:
                        last["content"] += line + "\n"

    if current and current["course_code"]:
        subjects.append(current)
    doc.close()
    return subjects


def rebuild_subjects_db(all_subjects):
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    c.execute("DROP TABLE IF EXISTS modules")
    c.execute("DROP TABLE IF EXISTS subjects")
    c.execute("""CREATE TABLE subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme TEXT, branch TEXT, semester INTEGER,
        course_code TEXT, course_title TEXT, credits INTEGER,
        document_type TEXT, source_file TEXT)""")
    c.execute("""CREATE TABLE modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER, module_number INTEGER,
        title TEXT, content TEXT,
        FOREIGN KEY(subject_id) REFERENCES subjects(id))""")

    # Dedupe by (scheme, branch, semester, course_code) — keep first occurrence
    seen = set()
    subject_count = 0
    module_count = 0

    for subj in all_subjects:
        code = subj.get("course_code")
        branch = subj.get("branch") or detect_branch_from_code(code)
        sem = subj.get("semester")
        if not code or not branch:
            continue
        key = (subj.get("scheme"), branch, sem, code)
        if key in seen:
            continue
        seen.add(key)

        c.execute("""INSERT INTO subjects
            (scheme, branch, semester, course_code, course_title, credits, document_type, source_file)
            VALUES (?,?,?,?,?,?,?,?)""",
            (subj.get("scheme"), branch, sem, code,
             subj.get("course_title") or code, subj.get("credits"),
             "syllabus", subj.get("source_file")))
        sid = c.lastrowid
        subject_count += 1

        for mod in subj.get("modules", []):
            c.execute("""INSERT INTO modules (subject_id, module_number, title, content)
                VALUES (?,?,?,?)""",
                (sid, mod.get("number"), mod.get("title"), mod.get("content")))
            module_count += 1

    # branches table
    c.execute("DROP TABLE IF EXISTS branches")
    c.execute("CREATE TABLE branches (code TEXT PRIMARY KEY, name TEXT)")
    c.execute("SELECT DISTINCT branch FROM subjects")
    for (branch,) in c.fetchall():
        if branch:
            c.execute("INSERT OR IGNORE INTO branches VALUES (?,?)", (branch, BRANCH_NAMES.get(branch, branch)))

    # semesters table
    c.execute("DROP TABLE IF EXISTS semesters")
    c.execute("CREATE TABLE semesters (id INTEGER PRIMARY KEY AUTOINCREMENT, scheme TEXT, branch TEXT, semester INTEGER, UNIQUE(scheme, branch, semester))")
    c.execute("SELECT DISTINCT scheme, branch, semester FROM subjects WHERE semester IS NOT NULL")
    for scheme, branch, semester in c.fetchall():
        c.execute("INSERT OR IGNORE INTO semesters (scheme, branch, semester) VALUES (?,?,?)", (scheme, branch, semester))

    conn.commit()
    conn.close()
    return subject_count, module_count


def main():
    print("=" * 60)
    print("  VivaMate VTU Auto-Importer v2")
    print("  Source: vtu.ac.in/pdf/2022_3to8/")
    print("=" * 60)

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    all_subjects = []
    downloaded = 0
    failed = []

    for branch, filename in BRANCH_PDFS.items():
        pdf_path = download_pdf(branch, filename)
        if not pdf_path:
            failed.append(branch)
            continue
        downloaded += 1
        subjects = parse_pdf_subjects(pdf_path, branch)
        with_mods = sum(1 for s in subjects if s["modules"])
        print(f"  📚 {branch}: {len(subjects)} subjects ({with_mods} with modules)")
        all_subjects.extend(subjects)

    print(f"\n📊 Total parsed: {len(all_subjects)}, Downloaded: {downloaded}, Failed: {failed}")

    subjects, modules = rebuild_subjects_db(all_subjects)
    print(f"🗄 DB rebuilt: {subjects} subjects, {modules} modules")

    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()
    c.execute("SELECT branch, COUNT(*) FROM subjects GROUP BY branch ORDER BY COUNT(*) DESC")
    print("\n📊 By branch:")
    for branch, count in c.fetchall():
        print(f"   {branch}: {count}")
    c.execute("SELECT semester, COUNT(*) FROM subjects WHERE branch='CSE' GROUP BY semester ORDER BY semester")
    print("\n   CSE by semester:")
    for sem, count in c.fetchall():
        print(f"     Sem {sem}: {count}")
    conn.close()
    print("\n✅ Auto-import complete!")


if __name__ == "__main__":
    main()
