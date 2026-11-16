import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
LEDGER_PATH = ROOT.parent / "strange-but-true" / "community-ledger.html"
ATLAS_SCOPE_PATH = ROOT / "data" / "project-atlas-scope.json"
OUTPUT_PATH = ROOT / "data" / "ledger-projects.json"
LEDGER_URL = "https://auraofintelligence.github.io/strange-but-true/community-ledger.html"

CARD_PATTERN = re.compile(
    r'<a class="layer-card project-card" href="(?P<url>[^"]+)"[^>]*>'
    r'<span>(?P<lane>.*?)</span><strong>(?P<title>.*?)</strong><p>(?P<summary>.*?)</p></a>',
    re.IGNORECASE | re.DOTALL,
)
TAG_PATTERN = re.compile(r"<[^>]+>")
REGION_PATTERN = re.compile(r'<section class="project-region" aria-labelledby="projects-(local|australian|global)">(.*?)</section>', re.DOTALL)
COLLABORATIVE_REPOS = {
    "7-mile-admin-prep", "plfc-community-platform", "plfc-ai-agent-md-forms",
    "rough-as-guts", "two-dogs-podcast-backend",
}
WIDER_LEDGER_URLS = {
    "https://github.com/auraofintelligence/australian-legal-engine",
    "https://p4a.xyz",
    "https://auraofintelligence.github.io/gajra-earth-infinity",
    "https://auraofintelligence.github.io/gajra-earth-public-hub",
    "https://auraofintelligence.github.io/gajra-earth-claude-build",
}
EXCLUDED_PROJECT_KEYS = {
    "songline-interface", "straddie-vitality-network-builders", "stradbroke-grants-lab",
}


def clean(value):
    return " ".join(html.unescape(TAG_PATTERN.sub("", value)).split())


def slugify(value):
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value or "project"


def repository_url(public_url):
    parsed = urlparse(public_url)
    if parsed.netloc.lower() == "github.com" and parsed.path.lower().startswith("/auraofintelligence/"):
        return public_url.rstrip("/")
    if parsed.netloc.lower() == "p4a.xyz":
        return "https://github.com/auraofintelligence/p4a-xyz-cinema"
    if parsed.netloc.lower() != "auraofintelligence.github.io":
        return ""
    repo = parsed.path.strip("/").split("/", 1)[0]
    return f"https://github.com/auraofintelligence/{repo}" if repo else ""


def read_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise SystemExit(f"Invalid JSON in {path}: {error}") from error


def main():
    if not LEDGER_PATH.exists():
        raise SystemExit(f"Community Ledger not found: {LEDGER_PATH}")

    source = LEDGER_PATH.read_text(encoding="utf-8")
    previous = read_json(OUTPUT_PATH) if OUTPUT_PATH.exists() else []
    previous_by_url = {item["public_url"].rstrip("/").casefold(): item for item in previous}
    previous_by_key = {item["project_key"]: item for item in previous}
    atlas_scope = {item["atlas_name"].casefold(): item for item in read_json(ATLAS_SCOPE_PATH)}
    projects = []
    seen = set()

    regions = REGION_PATTERN.findall(source)
    if not regions or not any(region == "local" and CARD_PATTERN.search(body) for region, body in regions):
        raise SystemExit("No local project section found in the Community Ledger")
    for region, match in ((region, match) for region, body in regions for match in CARD_PATTERN.finditer(body)):
        public_url = html.unescape(match.group("url")).strip()
        title = clean(match.group("title"))
        repo = repository_url(public_url)
        repo_name = repo.rsplit("/", 1)[-1].casefold()
        url_key = public_url.rstrip("/").casefold()
        title_key = slugify(title)
        old = previous_by_url.get(url_key) or previous_by_key.get(title_key)
        scoped = atlas_scope.get(repo_name, {})
        key = old["project_key"] if old else scoped.get("project_key", title_key)
        if EXCLUDED_PROJECT_KEYS.intersection((key, title_key, slugify(repo_name))):
            continue
        include = (
            region == "local" or old is not None
            or repo_name in COLLABORATIVE_REPOS or url_key in WIDER_LEDGER_URLS
        )
        if not include:
            continue
        if key in seen:
            raise SystemExit(f"Duplicate Community Ledger project key: {key}")
        seen.add(key)
        projects.append({
            "project_key": key,
            "title": title,
            "lane": clean(match.group("lane")),
            "summary": clean(match.group("summary")),
            "public_url": public_url,
            "repository_url": repo,
            "source_page": LEDGER_URL,
            "source_type": "community_ledger",
            "region": region,
            "involvement": "others_involved" if repo_name in COLLABORATIVE_REPOS else "invitation",
            "grant_angles": scoped.get("grant_angles", old.get("grant_angles", []) if old else []),
        })

    OUTPUT_PATH.write_text(json.dumps(projects, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(projects)} projects from the current Community Ledger.")


if __name__ == "__main__":
    main()
