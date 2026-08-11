#!/usr/bin/env python3
"""
VivaMate Paper Title Fixer — converts raw VTU filenames into readable titles
e.g. "1BCS301" → "BCS301 — Mathematics for Computer Science"
"""
import re
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "database" / "syllabus.db"

# Subject name lookup from subjects table
# Fallback names for common codes not in DB
EXTRA_NAMES = {
    "BCEDX103": "Design Thinking and Innovation",
    "BENG106": "Engineering Exploration",
    "BPHEC102": "Engineering Physics",
    "BCHEC102": "Engineering Chemistry",
    "BBEE105": "Basic Electrical Engineering",
    "BSKS106": "Samskrutika Kannada",
    "BPHEE102": "Applied Physics",
    "BECE105": "Basic Electronics",
    "BICO107": "Indian Constitution",
    "BEIT105": "Industrial Engineering",
    "BKSK109": "Kannada for Communication",
    "BMATS101": "Engineering Mathematics I",
    "BMATS201": "Engineering Mathematics II",
    "BMATE101": "Advanced Mathematics for ECE",
    "BPHYS102": "Physics for Engineers",
    "BCHES102": "Chemistry for Engineers",
    "BESCK104A": "Introduction to Programming",
    "BESCK104B": "Introduction to Web Development",
    "BESCK104C": "Introduction to Python",
    "BETCK105A": "Introduction to AI",
    "BETCK105B": "Introduction to IoT",
    "BETCK105C": "Introduction to Cyber Security",
    "BETCK105D": "Introduction to Data Science",
    "BETCK105E": "Introduction to Cloud Computing",
    "BETCK105F": "Introduction to BlockChain",
    "BETCK105G": "Introduction to AR/VR",
    "BETCK105H": "Introduction to Quantum Computing",
    "BHSK108": "Health and Wellness",
    "BSFH108": "Social and Family Health",
    "BWRK108": "Scientific Foundations of Health",
    "BKSK107": "Balake Kannada",
    "BSKS107": "Samskrutika Kannada",
}

# Map paper filename prefix to readable subject code
# VTU QP filenames are like: 1BCS301.pdf, 15CS73.pdf, 21CS51.pdf
def normalize_code(raw_code):
    """Extract clean subject code from messy paper filename code."""
    if not raw_code:
        return None
    code = raw_code.strip().upper()
    # Remove leading digits that aren't part of the code (e.g. "1BCS301" → "BCS301")
    # VTU codes: BCS301, 15CS73, 21CS51, 10EC51
    m = re.match(r"^(\d{2})([A-Z]{2,4})(\d{2,3}[A-Z]?)$", code)
    if m:
        year_prefix, letters, nums = m.groups()
        # 15CS73 → 15 prefix is scheme year; code is CS73 or 15CS73
        return f"{letters}{nums}"
    m = re.match(r"^(\d)([A-Z]{2,6}\d{2,4}[A-Z]?)$", code)
    if m:
        return m.group(2)
    return code


def main():
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    # Build name lookup from subjects table
    c.execute("SELECT course_code, course_title FROM subjects")
    name_lookup = {}
    for code, title in c.fetchall():
        if code and title:
            name_lookup[code.strip().upper()] = title.strip()

    # Add extra names
    for code, name in EXTRA_NAMES.items():
        name_lookup.setdefault(code.upper(), name)

    c.execute("SELECT id, course_code, title, url FROM question_papers")
    papers = c.fetchall()
    updated = 0

    for pid, course_code, title, url in papers:
        # Normalize the course code from DB (which came from filename)
        clean_code = normalize_code(course_code)
        new_title = None

        # Try to look up subject name
        if clean_code and clean_code in name_lookup:
            new_title = f"{clean_code} — {name_lookup[clean_code]}"
        else:
            # Fallback: readable filename
            base = title if title else (url.split("/")[-1] if url else "")
            base = re.sub(r"^\.pdf$|^\.pdf$", "", base)
            base = re.sub(r"^\d+", "", base)  # remove leading digit
            base = base.replace(".pdf", "").replace("_", " ").replace("-", " ")
            base = re.sub(r"\s+", " ", base).strip().upper()
            if base:
                new_title = base

        if new_title and new_title != title:
            c.execute("UPDATE question_papers SET title=?, course_code=? WHERE id=?",
                      (new_title, clean_code or course_code, pid))
            updated += 1

    conn.commit()

    # Show sample results
    c.execute("SELECT course_code, title FROM question_papers WHERE course_code IS NOT NULL LIMIT 12")
    print("Sample titles after fix:")
    for code, title in c.fetchall():
        print(f"  {code}: {title[:60]}")

    print(f"\n✅ Updated {updated} paper titles")
    conn.close()


if __name__ == "__main__":
    main()
