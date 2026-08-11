#!/usr/bin/env python3
"""
VivaMate Paper Cleaner — keeps only question papers for subjects in the DB
Removes ancient scheme papers (2015 and earlier) to keep the list clean.
"""
import re
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "database" / "syllabus.db"


def normalize_code(code):
    """Normalize paper codes to match subject codes: 1BCS301 → BCS301, 15CS73 → CS73."""
    if not code:
        return None
    code = code.strip().upper()
    m = re.match(r"^(\d{2})([A-Z]{2,4})(\d{2,3}[A-Z]?)$", code)
    if m:
        return f"{m.group(2)}{m.group(3)}"
    m = re.match(r"^(\d)([A-Z]{2,6}\d{2,4}[A-Z]?)$", code)
    if m:
        return m.group(2)
    return code


def main():
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    # Build subject code set
    c.execute("SELECT DISTINCT course_code FROM subjects")
    subject_codes = {row[0].strip().upper() for row in c.fetchall()}
    print(f"Subject codes in DB: {len(subject_codes)}")

    # Get all papers and normalize their codes
    c.execute("SELECT id, course_code, url FROM question_papers")
    papers = c.fetchall()

    keep = []
    remove = []
    matched = 0
    unmatched = 0

    for pid, raw_code, url in papers:
        norm = normalize_code(raw_code)
        if norm in subject_codes:
            keep.append(pid)
            matched += 1
            # Update course_code to the normalized version for consistency
            c.execute("UPDATE question_papers SET course_code=? WHERE id=?", (norm, pid))
        else:
            remove.append(pid)
            unmatched += 1

    print(f"Papers matching subjects: {matched}")
    print(f"Papers removed (old/unmatched): {unmatched}")

    # Remove old papers
    c.execute("DROP TABLE IF EXISTS question_papers_old")
    c.execute("CREATE TABLE question_papers_old AS SELECT * FROM question_papers")
    c.execute("DELETE FROM question_papers WHERE id NOT IN ({})".format(
        ",".join(str(p) for p in keep) if keep else "0"))
    conn.commit()

    c.execute("SELECT COUNT(*) FROM question_papers")
    remaining = c.fetchone()[0]
    print(f"\nRemaining papers: {remaining}")

    # Show what we kept
    c.execute("""SELECT course_code, title, branch FROM question_papers
        ORDER BY course_code LIMIT 15""")
    print("\nSample kept papers:")
    for code, title, branch in c.fetchall():
        print(f"  {code}: {title[:50]} | {branch}")

    conn.close()
    print("\n✅ Paper cleanup done!")


if __name__ == "__main__":
    main()
