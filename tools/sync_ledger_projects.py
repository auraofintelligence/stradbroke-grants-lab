import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
LEDGER_PATH = ROOT.parent / "strange-but-true" / "community-ledger.html"
OUTPUT_PATH = ROOT / "data" / "ledger-projects.json"
LEDGER_URL = "https://auraofintelligence.github.io/strange-but-true/community-ledger.html"

CARD_PATTERN = re.compile(
    r'<a class="layer-card project-card" href="(?P<url>[^"]+)"[^>]*>'
    r'<span>(?P<lane>.*?)</span><strong>(?P<title>.*?)</strong><p>(?P<summary>.*?)</p></a>',
    re.IGNORECASE | re.DOTALL,
)
TAG_PATTERN = re.compile(r"<[^>]+>")


def clean(value):
    return " ".join(html.unescape(TAG_PATTERN.sub("", value)).split())


def slugify(value):
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "project"


def repository_url(public_url):
    parsed = urlparse(public_url)
    if parsed.netloc.lower() != "auraofintelligence.github.io":
        return ""
    repo = parsed.path.strip("/").split("/", 1)[0]
    return f"https://github.com/auraofintelligence/{repo}" if repo else ""


def main():
    if not LEDGER_PATH.exists():
        raise SystemExit(f"Community Ledger not found: {LEDGER_PATH}")

    source = LEDGER_PATH.read_text(encoding="utf-8")
    projects = []
    seen = set()

    for match in CARD_PATTERN.finditer(source):
        public_url = html.unescape(match.group("url")).strip()
        title = clean(match.group("title"))
        key = slugify(title)
        if key in seen:
            raise SystemExit(f"Duplicate Community Ledger project key: {key}")
        seen.add(key)
        projects.append(
            {
                "project_key": key,
                "title": title,
                "lane": clean(match.group("lane")),
                "summary": clean(match.group("summary")),
                "public_url": public_url,
                "repository_url": repository_url(public_url),
                "source_page": LEDGER_URL,
            }
        )

    if not projects:
        raise SystemExit("No project cards found in the Community Ledger")

    OUTPUT_PATH.write_text(
        json.dumps(projects, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Synced {len(projects)} Community Ledger projects.")


if __name__ == "__main__":
    main()
