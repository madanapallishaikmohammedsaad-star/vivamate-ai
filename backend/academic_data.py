from backend.vtu_importer import fetch_course_documents


SCHEMES = [
    {
        "code": "2022",
        "name": "VTU 2022 Scheme",
    },
    {
        "code": "2025",
        "name": "VTU 2025 Scheme",
    },
]


_course_documents_cache = None


def get_course_documents():
    global _course_documents_cache

    if _course_documents_cache is None:
        _course_documents_cache = fetch_course_documents()

    return _course_documents_cache


def get_schemes():
    return SCHEMES


def get_subjects(scheme=None, search=None):
    documents = get_course_documents()

    subjects = {}

    for document in documents:
        document_scheme = document["scheme"]
        course_code = document["course_code"]

        if scheme and document_scheme != scheme:
            continue

        subject_key = (
            document_scheme,
            course_code,
        )

        if subject_key not in subjects:
            subjects[subject_key] = {
                "scheme": document_scheme,
                "course_code": course_code,
                "name": course_code,
                "documents": [],
            }

        subjects[subject_key]["documents"].append({
            "title": document["title"],
            "filename": document["filename"],
            "url": document["url"],
        })

    subject_list = list(subjects.values())

    if search:
        search_value = search.lower().strip()

        subject_list = [
            subject
            for subject in subject_list
            if (
                search_value
                in subject["course_code"].lower()
                or search_value
                in subject["name"].lower()
            )
        ]

    subject_list.sort(
        key=lambda subject: (
            subject["scheme"],
            subject["course_code"],
        )
    )

    return subject_list


def get_subject_by_code(course_code, scheme=None):
    course_code = course_code.upper().strip()

    subjects = get_subjects(
        scheme=scheme,
    )

    for subject in subjects:
        if subject["course_code"] == course_code:
            return subject

    return None


def search_subjects(query, scheme=None):
    return get_subjects(
        scheme=scheme,
        search=query,
    )


def get_subject_documents(course_code, scheme=None):
    subject = get_subject_by_code(
        course_code=course_code,
        scheme=scheme,
    )

    if subject is None:
        return []

    return subject["documents"]


def refresh_academic_data():
    global _course_documents_cache

    _course_documents_cache = fetch_course_documents()

    return {
        "message": "VTU academic data refreshed",
        "documents": len(_course_documents_cache),
    }
