import html
import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
LEDGER_PATH = ROOT.parent / "strange-but-true" / "community-ledger.html"
ATLAS_PATH = ROOT.parent / "project-atlas" / "data" / "projects.json"
ATLAS_SCOPE_PATH = ROOT / "data" / "project-atlas-scope.json"
OUTPUT_PATH = ROOT / "data" / "ledger-projects.json"
LEDGER_URL = "https://auraofintelligence.github.io/strange-but-true/community-ledger.html"
ATLAS_URL = "https://auraofintelligence.github.io/project-atlas/"

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


def read_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise SystemExit(f"Invalid JSON in {path}: {error}") from error


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
                "source_type": "community_ledger",
                "grant_angles": [],
            }
        )

    if not projects:
        raise SystemExit("No project cards found in the Community Ledger")

    ledger_count = len(projects)
    if not ATLAS_PATH.exists():
        raise SystemExit(f"Project Atlas data not found: {ATLAS_PATH}")
    if not ATLAS_SCOPE_PATH.exists():
        raise SystemExit(f"Project Atlas scope not found: {ATLAS_SCOPE_PATH}")

    atlas_data = read_json(ATLAS_PATH)
    atlas_projects = atlas_data.get("projects", [])
    atlas_by_name = {item.get("name"): item for item in atlas_projects}
    atlas_scope = read_json(ATLAS_SCOPE_PATH)
    if not isinstance(atlas_scope, list) or not atlas_scope:
        raise SystemExit("Project Atlas scope must be a non-empty list")

    seen_atlas_names = set()
    for scoped in atlas_scope:
        atlas_name = scoped.get("atlas_name", "")
        key = scoped.get("project_key", "")
        if atlas_name in seen_atlas_names:
            raise SystemExit(f"Duplicate Project Atlas scope name: {atlas_name}")
        seen_atlas_names.add(atlas_name)
        if key in seen:
            raise SystemExit(f"Duplicate tracked project key: {key}")
        source_project = atlas_by_name.get(atlas_name)
        if not source_project:
            raise SystemExit(f"Project Atlas scope item not found in Atlas data: {atlas_name}")
        first_built = source_project.get("firstBuilt", "")
        if not first_built.startswith("2026-"):
            raise SystemExit(f"Project Atlas scope item is not a 2026 project: {atlas_name} ({first_built or 'no date'})")
        public_url = source_project.get("publicPage", "")
        repo_url = source_project.get("repositoryUrl", "")
        if not public_url or not repo_url:
            raise SystemExit(f"Project Atlas scope item needs public page and repository URLs: {atlas_name}")
        grant_angles = scoped.get("grant_angles", [])
        if not isinstance(grant_angles, list) or not grant_angles:
            raise SystemExit(f"Project Atlas scope item needs grant angles: {atlas_name}")
        seen.add(key)
        projects.append(
            {
                "project_key": key,
                "title": source_project.get("title") or atlas_name,
                "lane": scoped.get("lane", "Project Atlas 2026"),
                "summary": scoped.get("summary_override") or source_project.get("description", ""),
                "public_url": public_url,
                "repository_url": repo_url,
                "source_page": ATLAS_URL,
                "source_type": "project_atlas_2026",
                "first_built": first_built,
                "atlas_name": atlas_name,
                "grant_angles": grant_angles,
                "selection_reason": scoped.get("selection_reason", "Relevant 2026 Project Atlas project selected for local funding research."),
            }
        )

    OUTPUT_PATH.write_text(
        json.dumps(projects, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    atlas_count = len(projects) - ledger_count
    print(f"Synced {ledger_count} Community Ledger projects and {atlas_count} relevant 2026 Project Atlas projects ({len(projects)} total).")


if __name__ == "__main__":
    main()
