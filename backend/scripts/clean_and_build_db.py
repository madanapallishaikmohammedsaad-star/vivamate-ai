#!/usr/bin/env python3
"""
VivaMate VTU Data Cleaning & SQLite Database Builder
Reads parsed_syllabus.json → cleans → builds syllabus.db
"""
import json
import re
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
INPUT_FILE = BASE_DIR / "cache" / "parsed_syllabus.json"
DB_FILE = BASE_DIR / "database" / "syllabus.db"
VTU_DIR = BASE_DIR / "data" / "vtu"

# === Branch Detection ===

BRANCH_FROM_FILENAME = {
    "csesch": "CSE", "csesysch": "CSE",
    "elecsch": "ECE", "ecesch": "ECE",
    "mechsch": "ME",
    "ciesch": "CE", "ivilsch": "CE",
    "isesch": "ISE",
    "aiesch": "AIML", "aimlsch": "AIML",
    "eesch": "EEE",
}

BRANCH_FROM_CODE = {
    "BCS": "CSE", "BCSD": "CSE", "BCSL": "CSE",
    "BCE": "CE",
    "BEE": "EEE",
    "BME": "ME",
    "BIS": "ISE",
    "BEC": "ECE",
    "BAI": "AIML",
    "BMAT": "MATH", "BPHY": "PHYS", "BCHE": "CHEM",
    "BHS": "HSS",
    "BESCK": "ECE", "BETCK": "ECE",
}

SEMESTER_RANGES = {
    "3-4": [3, 4],
    "5-6": [5, 6],
    "5-8": [5, 6, 7, 8],
    "7-8": [7, 8],
    "3-8": [3, 4, 5, 6, 7, 8],
}


def detect_branch(record):
    """Detect branch from filename and course code."""
    source = record.get("source_file", "").lower()
    code = record.get("course_code", "") or ""

    for pattern, branch in BRANCH_FROM_FILENAME.items():
        if pattern in source:
            return branch

    prefix3 = code[:3].upper()
    prefix4 = code[:4].upper()
    if prefix4 in BRANCH_FROM_CODE:
        return BRANCH_FROM_CODE[prefix4]
    if prefix3 in BRANCH_FROM_CODE:
        return BRANCH_FROM_CODE[prefix3]

    return None


def detect_semester_from_filename(record):
    """Try to detect semester from filename patterns."""
    source = record.get("source_file", "").lower()
    name = Path(source).stem.lower()

    m = re.search(r"sem[_-]?(\d)", name)
    if m:
        return int(m.group(1))

    m = re.search(r"semester[_-]?(\d)", name)
    if m:
        return int(m.group(1))

    if "3-8" in name or "38" in name:
        return "3-8"
    if "3-4" in name or "34" in name:
        return "3-4"
    if "5-6" in name or "56" in name:
        return "5-6"
    if "5-8" in name:
        return "5-8"
    if "7-8" in name:
        return "7-8"

    return None


def normalize_title(title):
    """Fix bad course titles."""
    if not title:
        return None
    bad = {"course code:", "course code", "*asc(ic)", "n/a", "none"}
    if title.strip().lower() in bad:
        return None
    return title.strip()


def is_removable(record):
    """Check if record should be removed."""
    source = (record.get("source_file") or "").lower()
    if any(w in source for w in ["notification", "regulation", "manual", "handbook"]):
        return True
    if not record.get("course_code"):
        return True
    return False


def clean_records(raw):
    """Clean and expand all records."""
    cleaned = []
    removed = 0
    expanded = 0

    for rec in raw:
        if is_removable(rec):
            removed += 1
            continue

        branch = detect_branch(rec)
        semester = rec.get("semester")
        title = normalize_title(rec.get("course_title"))

        if semester is None:
            semester = detect_semester_from_filename(rec)
        if semester is None:
            semester = 1  # default fallback

        if isinstance(semester, str) and semester in SEMESTER_RANGES:
            semesters = SEMESTER_RANGES[semester]
            expanded += 1
        else:
            try:
                semesters = [int(semester)]
            except (ValueError, TypeError):
                semesters = [1]

        for sem in semesters:
            cleaned.append({
                "scheme": rec.get("scheme"),
                "branch": branch,
                "semester": sem,
                "course_code": rec.get("course_code"),
                "course_title": title or rec.get("course_code"),
                "credits": rec.get("credits"),
                "document_type": rec.get("document_type"),
                "source_file": rec.get("source_file"),
                "modules": rec.get("modules", []),
            })

    return cleaned, removed, expanded


def build_database(records):
    """Create and populate SQLite database."""
    DB_FILE.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_FILE))
    c = conn.cursor()

    c.execute("DROP TABLE IF EXISTS modules")
    c.execute("DROP TABLE IF EXISTS subjects")
    c.execute("DROP TABLE IF EXISTS semesters")
    c.execute("DROP TABLE IF EXISTS branches")
    c.execute("DROP TABLE IF EXISTS schemes")

    c.execute("""CREATE TABLE schemes (
        code TEXT PRIMARY KEY, name TEXT)""")
    c.execute("""CREATE TABLE branches (
        code TEXT PRIMARY KEY, name TEXT)""")
    c.execute("""CREATE TABLE semesters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scheme TEXT, branch TEXT, semester INTEGER,
        UNIQUE(scheme, branch, semester))""")
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

    # Populate schemes
    schemes = set(r["scheme"] for r in records if r.get("scheme"))
    for s in sorted(schemes):
        c.execute("INSERT OR IGNORE INTO schemes VALUES (?, ?)",
                  (s, f"VTU {s} Scheme"))

    # Populate branches
    branch_names = {
        "CSE": "Computer Science and Engineering",
        "ECE": "Electronics and Communication Engineering",
        "EEE": "Electrical and Electronics Engineering",
        "ME": "Mechanical Engineering",
        "CE": "Civil Engineering",
        "ISE": "Information Science and Engineering",
        "AIML": "Artificial Intelligence and Machine Learning",
        "MATH": "Mathematics",
        "PHYS": "Physics",
        "CHEM": "Chemistry",
        "HSS": "Humanities & Social Sciences",
    }
    branches = set(r["branch"] for r in records if r.get("branch"))
    for b in sorted(branches):
        c.execute("INSERT OR IGNORE INTO branches VALUES (?, ?)",
                  (b, branch_names.get(b, b)))

    # Populate semesters
    sem_set = set()
    for r in records:
        key = (r["scheme"], r["branch"], r["semester"])
        if r.get("scheme") and r.get("branch") and key not in sem_set:
            sem_set.add(key)
            c.execute("INSERT INTO semesters (scheme, branch, semester) VALUES (?,?,?)", key)

    # Populate subjects + modules
    subject_count = 0
    module_count = 0
    for r in records:
        if not r.get("scheme") or not r.get("course_code"):
            continue
        c.execute("""INSERT INTO subjects
            (scheme, branch, semester, course_code, course_title,
             credits, document_type, source_file)
            VALUES (?,?,?,?,?,?,?,?)""",
            (r["scheme"], r.get("branch"), r["semester"],
             r["course_code"], r.get("course_title"),
             r.get("credits"), r.get("document_type"), r.get("source_file")))
        sid = c.lastrowid
        subject_count += 1

        for mod in r.get("modules", []):
            c.execute("""INSERT INTO modules
                (subject_id, module_number, title, content)
                VALUES (?,?,?,?)""",
                (sid, mod["number"], mod.get("title"), mod.get("content")))
            module_count += 1

    conn.commit()
    conn.close()
    return subject_count, module_count


def regenerate_json():
    """Regenerate VTU JSON files from database."""
    conn = sqlite3.connect(str(DB_FILE))
    c = conn.cursor()

    # schemes.json
    c.execute("SELECT code FROM schemes ORDER BY code")
    schemes = [row[0] for row in c.fetchall()]
    (VTU_DIR / "schemes.json").write_text(
        json.dumps(schemes, indent=2), encoding="utf-8")

    # branches.json
    c.execute("SELECT code, name FROM branches ORDER BY code")
    branches = [{"code": r[0], "name": r[1]} for r in c.fetchall()]
    (VTU_DIR / "branches.json").write_text(
        json.dumps(branches, indent=2, ensure_ascii=False), encoding="utf-8")

    # semesters.json
    c.execute("SELECT DISTINCT scheme, branch FROM semesters ORDER BY scheme, branch")
    sem_data = []
    for scheme, branch in c.fetchall():
        c.execute("SELECT DISTINCT semester FROM semesters WHERE scheme=? AND branch=? ORDER BY semester",
                  (scheme, branch))
        sems = [r[0] for r in c.fetchall()]
        sem_data.append({"scheme": scheme, "branch": branch, "semesters": sems})
    (VTU_DIR / "semesters.json").write_text(
        json.dumps(sem_data, indent=2), encoding="utf-8")

    # subjects.json
    c.execute("SELECT DISTINCT scheme, branch, semester FROM subjects ORDER BY scheme, branch, semester")
    subj_data = []
    for scheme, branch, semester in c.fetchall():
        c.execute("""SELECT course_code, course_title FROM subjects
            WHERE scheme=? AND branch=? AND semester=? ORDER BY course_code""",
            (scheme, branch, semester))
        subjects = [{"code": r[0], "name": r[1]} for r in c.fetchall()]
        subj_data.append({
            "scheme": scheme, "branch": branch,
            "semester": semester, "subjects": subjects
        })
    (VTU_DIR / "subjects.json").write_text(
        json.dumps(subj_data, indent=2, ensure_ascii=False), encoding="utf-8")

    conn.close()


def main():
    print("=" * 60)
    print("  VivaMate VTU Data Cleaning & Database Builder")
    print("=" * 60)

    raw = json.loads(INPUT_FILE.read_text(encoding="utf-8"))
    print(f"\n📂 Raw records loaded: {len(raw)}")

    records, removed, expanded = clean_records(raw)
    print(f"🧹 Removed: {removed} (notifications, null codes)")
    print(f"📏 Expanded ranges: {expanded} records")
    print(f"✅ Clean records: {len(records)}")

    subjects, modules = build_database(records)
    print(f"\n🗄 Database: {DB_FILE}")
    print(f"   Subjects: {subjects}")
    print(f"   Modules: {modules}")

    regenerate_json()
    print(f"   JSON regenerated: {VTU_DIR}")

    # Summary stats
    conn = sqlite3.connect(str(DB_FILE))
    c = conn.cursor()
    print(f"\n📊 Summary:")
    c.execute("SELECT COUNT(*) FROM subjects")
    print(f"   Total subjects: {c.fetchone()[0]}")
    c.execute("SELECT branch, COUNT(*) FROM subjects GROUP BY branch ORDER BY COUNT(*) DESC")
    for branch, count in c.fetchall():
        print(f"   {branch}: {count} subjects")
    print()
    c.execute("SELECT semester, COUNT(*) FROM subjects WHERE branch='CSE' GROUP BY semester ORDER BY semester")
    print("   CSE by semester:")
    for sem, count in c.fetchall():
        print(f"     Sem {sem}: {count} subjects")
    conn.close()
    print("\n✅ Done!")


if __name__ == "__main__":
    main()
