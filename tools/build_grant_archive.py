import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    today = datetime.now(timezone(timedelta(hours=10))).date().isoformat()
    rounds = {}
    snapshots = [(path.name, load(path)) for path in sorted((DATA / "history").glob("*.json"))]
    snapshots.append((None, {
        "grants": load(DATA / "grants.json"),
        "matches": load(DATA / "grant-project-matches.json"),
    }))
    for snapshot, data in snapshots:
        projects = {}
        for match in data.get("matches", []):
            projects.setdefault(match["grant_source_key"], set()).add(match["project_key"])
        for grant in data.get("grants", []):
            deadline = grant.get("deadline_date")
            if grant["opportunity_type"] != "grant":
                continue
            if grant["availability"] != "closed" and (not deadline or deadline >= today):
                continue
            key = (grant["source_key"], deadline)
            previous = rounds.get(key, {})
            rounds[key] = {
                **grant,
                "availability": "closed",
                "project_keys": sorted(set(previous.get("project_keys", [])) | projects.get(key[0], set())),
                "snapshot": snapshot or previous.get("snapshot"),
            }
    archive = sorted(rounds.values(), key=lambda item: (item["deadline_date"] or "", item["name"]), reverse=True)
    (DATA / "grant-archive.json").write_text(json.dumps(archive, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Indexed {len(archive)} closed grant rounds.")


if __name__ == "__main__":
    main()
