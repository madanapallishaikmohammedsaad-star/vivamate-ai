VTU_SCHEMES = {
    "2022": {
        "name": "VTU 2022 Scheme",
        "branches": {}
    },
    "2025": {
        "name": "VTU 2025 Scheme",
        "branches": {}
    }
}


def get_schemes():
    return [
        {
            "code": code,
            "name": data["name"]
        }
        for code, data in VTU_SCHEMES.items()
    ]


def get_branches(scheme):
    scheme_data = VTU_SCHEMES.get(scheme, {})

    return list(
        scheme_data.get("branches", {}).keys()
    )


def get_semesters(scheme, branch):
    branches = VTU_SCHEMES.get(
        scheme, {}
    ).get("branches", {})

    branch_data = branches.get(branch, {})

    return list(branch_data.keys())


def get_subjects(scheme, branch, semester):
    branches = VTU_SCHEMES.get(
        scheme, {}
    ).get("branches", {})

    branch_data = branches.get(branch, {})

    return branch_data.get(str(semester), [])


def search_subjects(query, scheme=None):
    query = query.lower().strip()

    results = []

    for scheme_code, scheme_data in VTU_SCHEMES.items():

        if scheme and scheme_code != scheme:
            continue

        for branch, semesters in scheme_data["branches"].items():

            for semester, subjects in semesters.items():

                for subject in subjects:

                    code = subject["code"].lower()
                    name = subject["name"].lower()

                    if query in code or query in name:

                        results.append({
                            "scheme": scheme_code,
                            "branch": branch,
                            "semester": semester,
                            "code": subject["code"],
                            "name": subject["name"]
                        })

    return results
