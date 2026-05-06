import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = {
    "data/grants.json": ["name", "level", "status", "best_for", "url", "last_checked"],
    "data/entities.json": ["name", "category", "location", "status", "grant_fit"],
    "data/projects.json": ["title", "domain", "summary", "grant_angles"],
    "data/source-docs.json": ["title", "type", "summary"],
    "data/grant-windows.json": ["title", "window_type", "notify", "tip", "action", "source"],
}


def fail(message):
    raise SystemExit(f"Data validation failed: {message}")


def main():
    for relative, fields in REQUIRED.items():
        path = ROOT / relative
        if not path.exists():
            fail(f"missing {relative}")
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            fail(f"{relative} is not valid JSON: {error}")
        if not isinstance(data, list) or not data:
            fail(f"{relative} must be a non-empty list")
        for index, item in enumerate(data, start=1):
            if not isinstance(item, dict):
                fail(f"{relative} item {index} is not an object")
            missing = [field for field in fields if field not in item or item[field] in ("", [], None)]
            if missing:
                fail(f"{relative} item {index} is missing {', '.join(missing)}")
    print("Data validation passed.")


if __name__ == "__main__":
    main()
