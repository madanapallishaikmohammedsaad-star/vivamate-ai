"""
VivaMate VTU Syllabus API — reads from SQLite database
"""
import os
import sys
from flask import Blueprint, request, jsonify

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import query_db, fetchone_db

syllabus = Blueprint("syllabus", __name__)


# === SCHEMES, BRANCHES, SEMESTERS, SUBJECTS ===

@syllabus.route("/api/schemes")
def get_schemes():
    rows = query_db("SELECT code, name FROM schemes ORDER BY code")
    return jsonify([r["code"] for r in rows])


@syllabus.route("/api/branches")
def get_branches():
    rows = query_db("SELECT code, name FROM branches ORDER BY code")
    return jsonify([{"code": r["code"], "name": r["name"]} for r in rows])


@syllabus.route("/api/semesters/<scheme>/<branch>")
def get_semesters(scheme, branch):
    rows = query_db(
        "SELECT DISTINCT semester FROM semesters WHERE scheme=? AND branch=? ORDER BY semester",
        (scheme, branch)
    )
    return jsonify([r["semester"] for r in rows])


@syllabus.route("/api/subjects/<scheme>/<branch>/<int:semester>")
def get_subjects(scheme, branch, semester):
    rows = query_db(
        """SELECT id, course_code, course_title, credits, document_type
           FROM subjects
           WHERE scheme=? AND branch=? AND semester=?
           ORDER BY course_code""",
        (scheme, branch, semester)
    )
    return jsonify([{
        "id": r["id"],
        "code": r["course_code"],
        "name": r["course_title"],
        "credits": r["credits"],
    } for r in rows])


@syllabus.route("/api/subjects/detail/<int:subject_id>")
def get_subject_detail(subject_id):
    row = fetchone_db("SELECT * FROM subjects WHERE id=?", (subject_id,))
    if not row:
        return jsonify({"error": "Subject not found"}), 404
    modules = query_db(
        "SELECT module_number, title, content FROM modules WHERE subject_id=? ORDER BY module_number",
        (subject_id,)
    )
    row["modules"] = modules
    return jsonify(row)


@syllabus.route("/api/modules/<int:subject_id>")
def get_modules(subject_id):
    rows = query_db(
        "SELECT module_number, title, content FROM modules WHERE subject_id=? ORDER BY module_number",
        (subject_id,)
    )
    return jsonify(rows)


@syllabus.route("/api/subjects/search")
def search_subjects():
    q = request.args.get("query", "").strip()
    scheme = request.args.get("scheme")
    if not q:
        return jsonify([])
    search = f"%{q}%"
    if scheme:
        rows = query_db(
            """SELECT id, course_code, course_title, scheme, branch, semester
               FROM subjects WHERE (course_code LIKE ? OR course_title LIKE ?) AND scheme=?
               ORDER BY course_code LIMIT 50""",
            (search, search, scheme)
        )
    else:
        rows = query_db(
            """SELECT id, course_code, course_title, scheme, branch, semester
               FROM subjects WHERE course_code LIKE ? OR course_title LIKE ?
               ORDER BY course_code LIMIT 50""",
            (search, search)
        )
    return jsonify(rows)


@syllabus.route("/api/subject-context/<int:subject_id>")
def get_subject_context(subject_id):
    row = fetchone_db("SELECT * FROM subjects WHERE id=?", (subject_id,))
    if not row:
        return jsonify({"error": "Subject not found"}), 404
    modules = query_db(
        "SELECT module_number, title, content FROM modules WHERE subject_id=? ORDER BY module_number",
        (subject_id,)
    )
    row["modules"] = modules
    return jsonify(row)


# === QUESTION PAPERS (from VTU website) ===

@syllabus.route("/api/papers/search")
def search_papers():
    q = request.args.get("query", "").strip()
    branch = request.args.get("branch")
    scheme = request.args.get("scheme")

    if not q and not branch and not scheme:
        return jsonify([])

    conditions = []
    params = []

    if q:
        search = f"%{q}%"
        conditions.append("(course_code LIKE ? OR title LIKE ?)")
        params.extend([search, search])
    if branch:
        conditions.append("branch = ?")
        params.append(branch)
    if scheme:
        conditions.append("scheme = ?")
        params.append(scheme)

    where = " AND ".join(conditions) if conditions else "1=1"
    rows = query_db(
        f"""SELECT id, course_code, branch, scheme, year, title, url, source
            FROM question_papers WHERE {where}
            ORDER BY year DESC, course_code LIMIT 100""",
        tuple(params)
    )
    return jsonify(rows)


@syllabus.route("/api/papers/subject/<course_code>")
def get_papers_by_subject(course_code):
    """Get all question papers for a specific subject code."""
    rows = query_db(
        """SELECT id, course_code, branch, scheme, year, title, url, source
           FROM question_papers WHERE course_code = ?
           ORDER BY year DESC""",
        (course_code.upper(),)
    )
    return jsonify(rows)


@syllabus.route("/api/papers/recent")
def get_recent_papers():
    """Get the most recent question papers."""
    limit = request.args.get("limit", 20, type=int)
    rows = query_db(
        """SELECT id, course_code, branch, scheme, year, title, url, source
           FROM question_papers ORDER BY fetched_at DESC LIMIT ?""",
        (limit,)
    )
    return jsonify(rows)


# === VTU NOTICES & TIMETABLES ===

@syllabus.route("/api/notices")
def get_notices():
    category = request.args.get("category")
    subcategory = request.args.get("subcategory")

    conditions = []
    params = []
    if category:
        conditions.append("category = ?")
        params.append(category)
    if subcategory:
        conditions.append("subcategory = ?")
        params.append(subcategory)

    where = " AND ".join(conditions) if conditions else "1=1"
    rows = query_db(
        f"""SELECT id, title, url, category, subcategory, fetched_at
            FROM vtu_notices WHERE {where}
            ORDER BY fetched_at DESC LIMIT 50""",
        tuple(params)
    )
    return jsonify(rows)


@syllabus.route("/api/notices/timetables")
def get_timetables():
    rows = query_db(
        """SELECT id, title, url, category, subcategory, fetched_at
           FROM vtu_notices WHERE subcategory = 'timetable'
           ORDER BY fetched_at DESC LIMIT 20"""
    )
    return jsonify(rows)


@syllabus.route("/api/notices/circulars")
def get_circulars():
    rows = query_db(
        """SELECT id, title, url, category, subcategory, fetched_at
           FROM vtu_notices WHERE subcategory = 'circular'
           ORDER BY fetched_at DESC LIMIT 20"""
    )
    return jsonify(rows)


# === STATS ===

@syllabus.route("/api/stats")
def get_stats():
    total_subjects = query_db("SELECT COUNT(*) as total FROM subjects")
    total_papers = query_db("SELECT COUNT(*) as total FROM question_papers")
    total_notices = query_db("SELECT COUNT(*) as total FROM vtu_notices")
    branches = query_db("SELECT branch, COUNT(*) as count FROM subjects GROUP BY branch ORDER BY count DESC")

    return jsonify({
        "total_subjects": total_subjects[0]["total"] if total_subjects else 0,
        "total_papers": total_papers[0]["total"] if total_papers else 0,
        "total_notices": total_notices[0]["total"] if total_notices else 0,
        "total_branches": len(branches),
        "branches": [{"name": b["branch"], "count": b["count"]} for b in branches],
    })
