import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


VTU_URL = "https://vtu.ac.in/en/b-e-scheme-syllabus/"

BASE_DIR = Path(__file__).resolve().parents[1]
CACHE_DIR = BASE_DIR / "cache" / "vtu"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/142.0 Safari/537.36"
    )
}


def clean_name(text):
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r'[<>:"/\\|?*]', "_", text)
    text = text.replace(" ", "_")
    return text[:100]


def classify_link(text, url):
    combined = f"{text} {url}".lower()

    if "2025" in combined:
        return "2025"

    if "2022" in combined or "ug2022" in combined:
        return "2022"

    return None


def get_url_filename(url):
    """
    Get the original filename from the VTU URL.
    Example:
    /pdf/2022_3to8/2mecsyll.pdf
    -> 2mecsyll.pdf
    """

    path = urlparse(url).path
    name = Path(path).name

    if not name:
        return "document.bin"

    return name


def build_filename(index, title, url):
    """
    Create a unique filename using:
    index + cleaned title + original VTU filename
    """

    original = get_url_filename(url)

    stem = Path(original).stem
    extension = Path(original).suffix

    title_clean = clean_name(title)
    stem_clean = clean_name(stem)

    if not extension:
        extension = ".bin"

    return (
        f"{index:04d}_{title_clean}_{stem_clean}{extension}"
    )


def download_file(session, url, destination):
    print(f"Downloading: {url}")

    response = session.get(
        url,
        headers=HEADERS,
        timeout=60,
        allow_redirects=True,
    )

    response.raise_for_status()

    destination.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    destination.write_bytes(response.content)

    print(
        f"Saved: {destination} "
        f"({len(response.content):,} bytes)"
    )


def run():

    CACHE_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("======================================")
    print("       VivaMate VTU Downloader")
    print("======================================")

    session = requests.Session()

    print("\nFetching official VTU page...")

    response = session.get(
        VTU_URL,
        headers=HEADERS,
        timeout=60,
    )

    response.raise_for_status()

    print(f"Page status: {response.status_code}")

    soup = BeautifulSoup(
        response.text,
        "html.parser",
    )

    links = []

    for anchor in soup.find_all("a", href=True):

        title = anchor.get_text(
            " ",
            strip=True,
        )

        href = anchor["href"].strip()

        if not title:
            continue

        absolute_url = urljoin(
            VTU_URL,
            href,
        )

        scheme = classify_link(
            title,
            absolute_url,
        )

        if scheme not in {"2022", "2025"}:
            continue

        links.append(
            {
                "scheme": scheme,
                "title": title,
                "url": absolute_url,
            }
        )

    # Remove duplicate URLs
    unique = {}

    for item in links:
        unique[item["url"]] = item

    links = list(unique.values())

    print(
        f"Found {len(links)} candidate links."
    )

    manifest = []

    for index, item in enumerate(
        links,
        start=1,
    ):

        print(
            f"\n[{index}/{len(links)}] "
            f"{item['scheme']} - {item['title']}"
        )

        filename = build_filename(
            index,
            item["title"],
            item["url"],
        )

        destination = (
            CACHE_DIR
            / item["scheme"]
            / filename
        )

        try:

            download_file(
                session,
                item["url"],
                destination,
            )

            item["local_path"] = str(
                destination.relative_to(BASE_DIR)
            )

            item["filename"] = filename
            item["status"] = "downloaded"

        except Exception as error:

            print(
                f"ERROR: {error}"
            )

            item["local_path"] = None
            item["filename"] = filename
            item["status"] = "failed"
            item["error"] = str(error)

        manifest.append(item)

    manifest_path = (
        CACHE_DIR / "manifest.json"
    )

    manifest_path.write_text(
        json.dumps(
            manifest,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print("\n======================================")
    print("Download completed.")
    print(
        f"Manifest saved to: {manifest_path}"
    )
    print("======================================")


if __name__ == "__main__":
    run()
