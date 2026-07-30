import json
import os
from flask import Blueprint

syllabus = Blueprint("syllabus", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
VTU_DIR = os.path.join(BASE_DIR, "data", "vtu")


@syllabus.route("/api/schemes")
def get_schemes():

    with open(
        os.path.join(VTU_DIR, "schemes.json"),
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)


@syllabus.route("/api/branches")
def get_branches():

    with open(
        os.path.join(VTU_DIR, "branches.json"),
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)
@syllabus.route("/api/semesters/<scheme>/<branch>")
def get_semesters(scheme, branch):

    with open(
        os.path.join(VTU_DIR, "semesters.json"),
        "r",
        encoding="utf-8",
    ) as file:

        data = json.load(file)

    for item in data:
        if item["scheme"] == scheme and item["branch"] == branch:
            return item["semesters"]

    return []
@syllabus.route("/api/subjects/<scheme>/<branch>/<int:semester>")
def get_subjects(scheme, branch, semester):

    with open(
        os.path.join(VTU_DIR, "subjects.json"),
        "r",
        encoding="utf-8",
    ) as file:

        data = json.load(file)

    for item in data:
        if (
            item["scheme"] == scheme
            and item["branch"] == branch
            and item["semester"] == semester
        ):
            return item["subjects"]

    return []
