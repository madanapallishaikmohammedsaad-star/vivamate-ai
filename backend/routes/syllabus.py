"""
VivaMate VTU Syllabus API — reads from SQLite database
"""
import os
import sys
from flask import Blueprint, request, jsonify

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import query_db, fetchone_db

syllabus = Blueprint("syllabus", __name__)


# === LIST ENDPOINTS ===

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


# === DETAIL ENDPOINTS ===

@syllabus.route("/api/subjects/detail/<int:subject_id>")
def get_subject_detail(subject_id):
    row = fetchone_db(
        "SELECT * FROM subjects WHERE id=?", (subject_id,)
    )
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


# === SEARCH ===

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
               FROM subjects
               WHERE (course_code LIKE ? OR course_title LIKE ?) AND scheme=?
               ORDER BY course_code LIMIT 50""",
            (search, search, scheme)
        )
    else:
        rows = query_db(
            """SELECT id, course_code, course_title, scheme, branch, semester
               FROM subjects
               WHERE course_code LIKE ? OR course_title LIKE ?
               ORDER BY course_code LIMIT 50""",
            (search, search)
        )
    return jsonify(rows)


# === AI CONTEXT ===

@syllabus.route("/api/subject-context/<int:subject_id>")
def get_subject_context(subject_id):
    """Get full subject context for AI prompt — scheme, branch, semester, modules."""
    row = fetchone_db(
        "SELECT * FROM subjects WHERE id=?", (subject_id,)
    )
    if not row:
        return jsonify({"error": "Subject not found"}), 404

    modules = query_db(
        "SELECT module_number, title, content FROM modules WHERE subject_id=? ORDER BY module_number",
        (subject_id,)
    )

    context = {
        "course_code": row["course_code"],
        "course_title": row["course_title"],
        "scheme": row["scheme"],
        "branch": row["branch"],
        "semester": row["semester"],
        "credits": row["credits"],
        "modules": [{"number": m["module_number"], "title": m["title"], "content": m["content"]} for m in modules],
    }
    return jsonify(context)


# === STATS ===

@syllabus.route("/api/stats")
def get_stats():
    conn_stats = query_db("SELECT COUNT(*) as total FROM subjects")
    total = conn_stats[0]["total"] if conn_stats else 0

    branches = query_db("SELECT branch, COUNT(*) as count FROM subjects GROUP BY branch ORDER BY count DESC")

    return jsonify({
        "total_subjects": total,
        "total_branches": len(branches),
        "branches": [{"name": b["branch"], "count": b["count"]} for b in branches],
    })
