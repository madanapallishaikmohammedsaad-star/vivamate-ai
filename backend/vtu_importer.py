import re
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


def clean_html(html):
    text = re.sub(
        r"<script.*?</script>",
        " ",
        html,
        flags=re.DOTALL | re.IGNORECASE,
    )

    text = re.sub(
        r"<style.*?</style>",
        " ",
        text,
        flags=re.DOTALL | re.IGNORECASE,
    )

    text = re.sub(r"<[^>]+>", "\n", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def fetch_official_vtu_data():
    html = download_vtu_page()
    text = clean_html(html)

    return {
        "source": "Official VTU Website",
        "url": VTU_SYLLABUS_URL,
        "content_length": len(text),
        "content": text,
    }


if __name__ == "__main__":
    data = fetch_official_vtu_data()

    print("Source:", data["source"])
    print("URL:", data["url"])
    print(
        "Content length:",
        data["content_length"],
    )
    print()
    print(data["content"][:1000])
