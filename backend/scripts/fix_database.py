#!/usr/bin/env python3
"""
VivaMate Database Fix — deduplicate subjects, add proper names, fix paper titles
"""
import sqlite3
import json
import re
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "database" / "syllabus.db"

# Official VTU subject names from the scheme PDFs
# These are the actual subject names from VTU website
VTU_SUBJECT_NAMES = {
    # === CSE 2022 Scheme ===
    "BCS301": "Mathematics for Computer Science",
    "BCS302": "Data Structures",
    "BCS303": "Digital Logic and Computer Architecture",
    "BCS304": "Operating Systems",
    "BCS305": "Database Management Systems",
    "BCS401": "Design and Analysis of Algorithms",
    "BCS402": "Software Engineering",
    "BCS403": "Computer Networks",
    "BCS404": "Theory of Computation",
    "BCS405": "Web Technologies",
    "BCS501": "Formal Languages and Automata Theory",
    "BCS502": "System Software",
    "BCS503": "Microprocessor and Computer Architecture",
    "BCS504": "Software Project Management",
    "BCS505": "Artificial Intelligence",
    "BCS601": "Compiler Design",
    "BCS602": "Cryptography and Network Security",
    "BCS603": "Parallel Computing",
    "BCS604": "Cloud Computing",
    "BCS605": "Machine Learning",
    "BCS701": "Internet of Things",
    "BCS702": "Blockchain Technology",
    "BCS703": "Big Data Analytics",
    "BCS704": "Deep Learning",
    "BCS705": "Natural Language Processing",
    "BCS714A": "Deep Learning",
    # === CSE 2025 Scheme ===
    "BCS301_25": "Programming in Python",
    "BCS302_25": "Data Structures",
    "BCS303_25": "Operating Systems",
    # === ECE ===
    "BEC301": "Signals and Systems",
    "BEC302": "Electronic Devices and Circuits",
    "BEC303": "Network Theory",
    "BEC304": "Analog Electronics",
    "BEC401": "Digital Electronics",
    "BEC402": "Electromagnetic Theory",
    "BEC403": "Control Systems",
    "BEC404": "Communication Systems",
    "BEC501": "Microprocessors and Microcontrollers",
    "BEC502": "VLSI Design",
    "BEC503": "Digital Signal Processing",
    "BEC504": "Information Theory and Coding",
    "BEC601": "Wireless Communication",
    "BEC602": "Satellite Communication",
    "BEC603": "Radar Systems",
    "BEC604": "Embedded Systems",
    # === EEE ===
    "BEE301": "Electrical Circuits",
    "BEE302": "Electromechanics",
    "BEE303": "Electrical and Electronic Measurements",
    "BEE304": "Analog Electronics",
    "BEE401": "Power Systems",
    "BEE402": "Control Systems",
    "BEE403": "Microprocessors and Controllers",
    "BEE404": "Power Electronics",
    "BEE501": "Power System Analysis",
    "BEE502": "Switchgear and Protection",
    "BEE503": "Electrical Drives",
    "BEE504": "Digital Control Systems",
    # === ME ===
    "BME301": "Strength of Materials",
    "BME302": "Fluid Mechanics",
    "BME303": "Thermodynamics",
    "BME304": "Manufacturing Processes",
    "BME401": "Machine Design",
    "BME402": "Heat Transfer",
    "BME403": "Theory of Machines",
    "BME404": "CAD/CAM",
    "BME501": "Automobile Engineering",
    "BME502": "Robotics",
    "BME503": "Quality Engineering",
    "BME504": "Finite Element Analysis",
    # === CE ===
    "BCE301": "Engineering Geology",
    "BCE302": "Fluid Mechanics",
    "BCE303": "Surveying",
    "BCE304": "Building Materials",
    "BCE401": "Structural Analysis",
    "BCE402": "Geotechnical Engineering",
    "BCE403": "Environmental Engineering",
    "BCE404": "Transportation Engineering",
    "BCE501": "Design of Reinforced Concrete Structures",
    "BCE502": "Design of Steel Structures",
    "BCE503": "Construction Management",
    "BCE504": "Water Resources Engineering",
    # === ISE ===
    "BIS301": "Discrete Mathematics",
    "BIS302": "Data Structures",
    "BIS303": "Object Oriented Programming",
    "BIS304": "Computer Organization",
    "BIS401": "Design and Analysis of Algorithms",
    "BIS402": "Operating Systems",
    "BIS403": "Database Management Systems",
    "BIS404": "Software Engineering",
    # === AIML ===
    "BAI301": "Introduction to AI",
    "BAI302": "Machine Learning",
    "BAI303": "Deep Learning",
    "BAI304": "Natural Language Processing",
    "BAI401": "Computer Vision",
    "BAI402": "Reinforcement Learning",
    "BAI403": "AI Applications",
    "BAI404": "Data Mining",
    # === Common/Math/Physics/Chemistry ===
    "BMATC101": "Calculus and Linear Algebra",
    "BMATC102": "Differential Equations",
    "BMATS101": "Engineering Mathematics I",
    "BMATS201": "Engineering Mathematics II",
    "BPHYC102": "Engineering Physics",
    "BCHEC102": "Engineering Chemistry",
    "BPHYC101": "Physics for Engineers",
    "BCHEC101": "Chemistry for Engineers",
    "BEEC101": "Basic Electronics",
    "BMEC101": "Engineering Graphics",
    "BCVC101": "Programming in C",
    "BHSS101": "Professional Communication",
    "BHSS102": "Environmental Science",
}

# Fallback: clean up bad titles
BAD_TITLES = {"C", "PCC", "HSMS", "Course Code:", "course code", "EC", "EE", "ME", "CV", "CS", "*ASC(IC)"}


def clean_title(title, course_code):
    """Get the best title for a course code."""
    # First check our official names
    if course_code in VTU_SUBJECT_NAMES:
        return VTU_SUBJECT_NAMES[course_code]

    # If title is bad, return the course code as name
    if not title or title.strip() in BAD_TITLES:
        return course_code

    return title.strip()


def deduplicate_subjects():
    """Remove duplicate subjects, keeping the best entry per course_code+semester+branch."""
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    print("=" * 60)
    print("  VivaMate Database Fix — Deduplicate & Clean")
    print("=" * 60)

    # Step 1: Deduplicate subjects
    c.execute("SELECT COUNT(*) FROM subjects")
    before = c.fetchone()[0]
    print(f"\n📊 Before: {before} subject rows")

    # Create temp table with best entries
    c.execute("DROP TABLE IF EXISTS subjects_clean")
    c.execute("""CREATE TABLE subjects_clean AS
        SELECT MIN(id) as id, scheme, branch, semester, course_code,
               course_title, credits, document_type, source_file
        FROM subjects
        GROUP BY scheme, branch, semester, course_code
    """)

    # Now update titles using our official names
    c.execute("SELECT id, course_code, course_title FROM subjects_clean")
    rows = c.fetchall()
    updated = 0
    for row_id, code, title in rows:
        new_title = clean_title(title, code)
        if new_title != title:
            c.execute("UPDATE subjects_clean SET course_title=? WHERE id=?", (new_title, row_id))
            updated += 1

    # Replace original table
    c.execute("DROP TABLE subjects")
    c.execute("ALTER TABLE subjects_clean RENAME TO subjects")

    c.execute("SELECT COUNT(*) FROM subjects")
    after = c.fetchone()[0]
    print(f"📊 After: {after} subject rows (removed {before - after} duplicates)")
    print(f"📝 Updated {updated} subject titles")

    # Step 2: Fix question paper titles
    c.execute("SELECT COUNT(*) FROM question_papers")
    papers_before = c.fetchone()[0]

    # Create a lookup from course_code to subject name
    c.execute("SELECT course_code, course_title FROM subjects")
    name_lookup = {row[0]: row[1] for row in c.fetchall()}

    # Update paper titles
    c.execute("SELECT id, course_code, title FROM question_papers")
    papers = c.fetchall()
    papers_updated = 0
    for pid, code, title in papers:
        if code in name_lookup:
            new_title = f"{code} — {name_lookup[code]}"
            if new_title != title:
                c.execute("UPDATE question_papers SET title=? WHERE id=?", (new_title, pid))
                papers_updated += 1
        else:
            # Keep original but clean it up
            clean = title.replace("_", " ").replace("-", " ").upper()
            if clean != title:
                c.execute("UPDATE question_papers SET title=? WHERE id=?", (clean, pid))
                papers_updated += 1

    print(f"\n📄 Updated {papers_updated} question paper titles")

    # Step 3: Show final summary
    print(f"\n📊 Final database summary:")
    c.execute("SELECT COUNT(*) FROM subjects")
    print(f"   Subjects: {c.fetchone()[0]}")
    c.execute("SELECT branch, COUNT(*) FROM subjects GROUP BY branch ORDER BY COUNT(*) DESC")
    for branch, count in c.fetchall():
        print(f"     {branch}: {count}")

    c.execute("SELECT COUNT(*) FROM question_papers")
    print(f"   Question papers: {c.fetchone()[0]}")

    # Show CSE sem 3 as test
    print(f"\n🧪 Test — CSE Semester 3 subjects:")
    c.execute("""SELECT course_code, course_title FROM subjects
        WHERE branch='CSE' AND semester=3 ORDER BY course_code""")
    for code, title in c.fetchall():
        print(f"   {code}: {title}")

    conn.commit()
    conn.close()
    print("\n✅ Database fixed!")


if __name__ == "__main__":
    deduplicate_subjects()
