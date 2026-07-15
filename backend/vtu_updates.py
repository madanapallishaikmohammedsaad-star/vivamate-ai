VTU_OFFICIAL_BASE_URL = "https://vtu.ac.in"


VTU_UPDATE_CATEGORIES = {
    "circulars": {
        "name": "VTU Circulars",
        "source": "Official VTU Website"
    },
    "timetables": {
        "name": "Exam Timetables",
        "source": "Official VTU Website"
    }
}


VTU_UPDATES = []


def get_update_categories():
    return [
        {
            "code": code,
            "name": data["name"],
            "source": data["source"]
        }
        for code, data in VTU_UPDATE_CATEGORIES.items()
    ]


def get_updates(category=None):
    if category is None:
        return VTU_UPDATES

    return [
        update
        for update in VTU_UPDATES
        if update["category"] == category
    ]


def search_updates(query):
    query = query.lower().strip()

    results = []

    for update in VTU_UPDATES:
        title = update.get("title", "").lower()
        description = update.get("description", "").lower()

        if query in title or query in description:
            results.append(update)

    return results
