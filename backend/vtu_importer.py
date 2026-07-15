import re
import html
from urllib.parse import urljoin
from urllib.request import Request, urlopen


VTU_SYLLABUS_URL = (
    "https://vtu.ac.in/en/b-e-scheme-syllabus/"
)


def download_vtu_page():
    request = Request(
        VTU_SYLLABUS_URL,
        headers={
            "User-Agent": "VivaMate-AI/1.0"
        },
    )

    with urlopen(request, timeout=30) as response:
        return response.read().decode(
            "utf-8",
            errors="ignore",
        )


def clean_text(value):
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def extract_official_links(page_html):
    link_pattern = re.compile(
        r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
        re.IGNORECASE | re.DOTALL,
    )

    links = []

    for href, label_html in link_pattern.findall(page_html):
        label = clean_text(label_html)
        url = urljoin(VTU_SYLLABUS_URL, href)

        searchable_text = (
            label + " " + url
        ).lower()

        if (
            "2022" in searchable_text
            or "2025" in searchable_text
            or "syllabus" in searchable_text
            or "scheme" in searchable_text
        ):
            links.append({
                "title": label,
                "url": url,
            })

    unique_links = []

    seen = set()

    for link in links:
        key = link["url"]

        if key not in seen:
            seen.add(key)
            unique_links.append(link)

    return unique_links


def fetch_official_vtu_links():
    page_html = download_vtu_page()

    return extract_official_links(page_html)


if __name__ == "__main__":
    links = fetch_official_vtu_links()

    print(
        "Official VTU academic links found:",
        len(links),
    )

    print()

    for index, link in enumerate(
        links[:100],
        start=1,
    ):
        print(
            f'{index}. {link["title"]}'
        )
        print(
            f'   {link["url"]}'
        )
        print()
