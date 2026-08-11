"""
VivaMate VTU Live Scraper — fetches real data from vtu.ac.in
Question papers, timetables, circulars, and scheme info
"""
import re
import json
import sqlite3
import html
import os
import sys
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))
from db import DB_PATH

VTU_BASE = "https://vtu.ac.in"
QP_URL = f"{VTU_BASE}/en/model-question-paper-b-e-b-tech-b-arch/"
SYLLABUS_URL = f"{VTU_BASE}/en/b-e-scheme-syllabus/"
NOTICES_URL = f"{VTU_BASE}/en/notices/"
EXAM_URL = f"{VTU_BASE}/en/examination-section/"
CIRCULARS_URL = f"{VTU_BASE}/en/circulars/"

HEADERS = {"User-Agent": "VivaMate-AI/1.0 (Student Project)"}


def fetch_page(url):
    """Fetch a web page with error handling."""
    try:
        req = Request(url, headers=HEADERS)
        with urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  ⚠️ Failed to fetch {url}: {e}")
        return ""


def clean_text(text):
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# === QUESTION PAPERS ===

def detect_scheme_from_url(url):
    url_lower = url.lower()
    if "2022" in url_lower or "scheme22" in url_lower:
        return "2022"
    if "2025" in url_lower or "scheme25" in url_lower:
        return "2025"
    if "2018" in url_lower or "2014" in url_lower:
        return "2018"
    return "Unknown"


def detect_subject_code_from_filename(filename):
    """Extract subject code from VTU question paper filename."""
    name = Path(filename).stem.upper()
    patterns = [
        r"(\d{2}[A-Z]{2,6}\d{3}[A-Z]?)",  # 15CS73, 21CS301
        r"([A-Z]{2,5}\d{3}[A-Z]?)",  # BCS301, CS73
    ]
    for pattern in patterns:
        match = re.search(pattern, name)
        if match:
            return match.group(1)
    return None


def detect_branch_from_code(code):
    if not code:
        return None
    code = code.upper()
    branch_map = {
        "CS": "CSE", "BCS": "CSE", "15CS": "CSE", "21CS": "CSE",
        "EC": "ECE", "BEC": "ECE", "15EC": "ECE", "21EC": "ECE",
        "EE": "EEE", "BEE": "EEE", "15EE": "EEE",
        "ME": "ME", "BME": "ME", "15ME": "ME",
        "CV": "CE", "BCE": "CE", "15CV": "CE",
        "IS": "ISE", "BIS": "ISE",
        "AI": "AIML", "BAI": "AIML",
    }
    for prefix, branch in branch_map.items():
        if code.startswith(prefix):
            return branch
    return None


def detect_year_from_filename(filename):
    """Try to detect exam year from filename."""
    match = re.search(r"(20[12]\d)", filename)
    if match:
        return match.group(1)
    return None


def scrape_question_papers():
    """Scrape all question papers from VTU website."""
    print("📄 Scraping VTU question papers...")
    html_page = fetch_page(QP_URL)

    if not html_page:
        print("  ❌ Could not fetch question papers page")
        return []

    # Find all PDF links in the QP directory
    qp_pattern = re.compile(r'href="(https://vtu\.ac\.in/pdf/QP/[^"]+\.pdf)"', re.I)
    papers = []
    seen_urls = set()

    for match in qp_pattern.finditer(html_page):
        url = match.group(1)
        if url in seen_urls:
            continue
        seen_urls.add(url)

        filename = url.split("/")[-1]
        code = detect_subject_code_from_filename(filename)
        branch = detect_branch_from_code(code)
        scheme = detect_scheme_from_url(url)
        year = detect_year_from_filename(filename)

        papers.append({
            "course_code": code,
            "branch": branch,
            "scheme": scheme,
            "year": year,
            "title": filename.replace(".pdf", "").replace("_", " ").replace("-", " ").upper(),
            "url": url,
            "source": "vtu.ac.in",
        })

    print(f"  ✅ Found {len(papers)} question papers")
    return papers


# === TIMETABLES & CIRCULARS ===

def scrape_notices():
    """Scrape timetables and circulars from VTU website."""
    print("📋 Scraping VTU notices, timetables, and circulars...")
    notices = []

    for url, category in [
        (NOTICES_URL, "notices"),
        (CIRCULARS_URL, "circulars"),
        (EXAM_URL, "exam"),
    ]:
        html_page = fetch_page(url)
        if not html_page:
            continue

        # Find PDF links
        pdf_pattern = re.compile(
            r'<a[^>]*href="([^"]*\.pdf)"[^>]*>([^<]+)</a>',
            re.I
        )

        for pdf_url, title in pdf_pattern.findall(html_page):
            full_url = urljoin(url, pdf_url)
            title_clean = clean_text(title)

            if not title_clean or len(title_clean) < 3:
                continue

            # Detect if it's a timetable
            is_timetable = any(w in title_clean.lower() for w in [
                "timetable", "time table", "schedule", "exam schedule"
            ])
            is_circular = any(w in title_clean.lower() for w in [
                "circular", "notification", "order"
            ])

            subcategory = "other"
            if is_timetable:
                subcategory = "timetable"
            elif is_circular:
                subcategory = "circular"

            notices.append({
                "title": title_clean,
                "url": full_url,
                "category": category,
                "subcategory": subcategory,
                "fetched_at": datetime.now().isoformat(),
            })

    print(f"  ✅ Found {len(notices)} notices")
    return notices


# === SAVE TO DATABASE ===

def save_papers_to_db(papers):
    """Save scraped question papers to SQLite."""
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    c.execute("DROP TABLE IF EXISTS question_papers")
    c.execute("""CREATE TABLE question_papers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT,
        branch TEXT,
        scheme TEXT,
        year TEXT,
        title TEXT,
        url TEXT,
        source TEXT,
        fetched_at TEXT
    )""")

    count = 0
    for p in papers:
        c.execute(
            """INSERT INTO question_papers
            (course_code, branch, scheme, year, title, url, source, fetched_at)
            VALUES (?,?,?,?,?,?,?,?)""",
            (p["course_code"], p["branch"], p["scheme"], p["year"],
             p["title"], p["url"], p["source"],
             datetime.now().isoformat())
        )
        count += 1

    conn.commit()
    conn.close()
    return count


def save_notices_to_db(notices):
    """Save scraped notices/timetables to SQLite."""
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()

    c.execute("DROP TABLE IF EXISTS vtu_notices")
    c.execute("""CREATE TABLE vtu_notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        url TEXT,
        category TEXT,
        subcategory TEXT,
        fetched_at TEXT
    )""")

    count = 0
    for n in notices:
        c.execute(
            """INSERT INTO vtu_notices
            (title, url, category, subcategory, fetched_at)
            VALUES (?,?,?,?,?)""",
            (n["title"], n["url"], n["category"], n["subcategory"],
             n["fetched_at"])
        )
        count += 1

    conn.commit()
    conn.close()
    return count


def main():
    print("=" * 60)
    print("  VivaMate VTU Live Data Scraper")
    print("=" * 60)

    papers = scrape_question_papers()
    paper_count = save_papers_to_db(papers)
    print(f"\n💾 Saved {paper_count} question papers to database")

    notices = scrape_notices()
    notice_count = save_notices_to_db(notices)
    print(f"💾 Saved {notice_count} notices/timetables to database")

    # Summary
    conn = sqlite3.connect(str(DB_PATH))
    c = conn.cursor()
    print(f"\n📊 Database summary:")
    c.execute("SELECT COUNT(*) FROM question_papers")
    print(f"   Question papers: {c.fetchone()[0]}")
    c.execute("SELECT branch, COUNT(*) FROM question_papers WHERE branch IS NOT NULL GROUP BY branch ORDER BY COUNT(*) DESC")
    for branch, count in c.fetchall():
        print(f"     {branch}: {count}")
    c.execute("SELECT COUNT(*) FROM vtu_notices")
    print(f"   Notices/timetables: {c.fetchone()[0]}")
    c.execute("SELECT subcategory, COUNT(*) FROM vtu_notices GROUP BY subcategory")
    for sub, count in c.fetchall():
        print(f"     {sub}: {count}")
    conn.close()

    print("\n✅ VTU live data scraping complete!")


if __name__ == "__main__":
    main()
