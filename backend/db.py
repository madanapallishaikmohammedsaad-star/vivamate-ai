"""
Database helper — SQLite connection for VivaMate
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "database" / "syllabus.db"


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def query_db(sql, params=()):
    conn = get_db()
    results = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(row) for row in results]


def fetchone_db(sql, params=()):
    conn = get_db()
    result = conn.execute(sql, params).fetchone()
    conn.close()
    return dict(result) if result else None
