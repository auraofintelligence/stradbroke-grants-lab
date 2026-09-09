import argparse
import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GRANTS_PATH = ROOT / "data" / "grants.json"
MATCHES_PATH = ROOT / "data" / "grant-project-matches.json"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Remove expired or closed grant records from active project funding stacks."
    )
    parser.add_argument(
        "--as-of",
        type=date.fromisoformat,
        default=date.today(),
        help="Cut-off date in YYYY-MM-DD format. Defaults to today.",
    )
    return parser.parse_args()


def is_expired(grant, as_of):
    if grant["availability"] == "closed":
        return True
    deadline = grant.get("deadline_date")
    return deadline is not None and date.fromisoformat(deadline) < as_of


def main():
    args = parse_args()
    grants = json.loads(GRANTS_PATH.read_text(encoding="utf-8"))
    matches = json.loads(MATCHES_PATH.read_text(encoding="utf-8"))
    grants_by_key = {item["source_key"]: item for item in grants}

    retained = []
    removed = []
    for match in matches:
        grant = grants_by_key.get(match["grant_source_key"])
        if grant is None:
            retained.append(match)
            continue
        if is_expired(grant, args.as_of):
            removed.append(match)
        else:
            retained.append(match)

    MATCHES_PATH.write_text(
        json.dumps(retained, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"Removed {len(removed)} expired funding pathways as at {args.as_of.isoformat()}.")
    for match in removed:
        print(
            f"- {match['project_key']} <- {match['grant_source_key']}"
        )


if __name__ == "__main__":
    main()
