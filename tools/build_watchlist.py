import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PRIORITY_BY_LEVEL = {
    "council": "Local fit",
    "queensland": "State fit",
    "first-nations": "Cultural authority",
    "federal": "National program",
    "island": "Local support",
    "global": "Partnership",
}

LEVEL_ORDER = ["council", "queensland", "first-nations", "federal", "island", "global"]


def read_json(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def window_for(grant, windows):
    grant_text = f"{grant['name']} {grant['level_label']} {grant['best_for']}".lower()
    for window in windows:
        source = window["source"].lower()
        if any(token in source for token in grant_text.split()[:3]):
            return window
    for window in windows:
        if grant["level"] in window["notify"].lower() or grant["level_label"].split()[0].lower() in window["source"].lower():
            return window
    return {
        "window_type": "Source watch",
        "action": "Check current round, eligibility, deadline, evidence and reporting duties before drafting.",
        "tip": grant["best_for"],
    }


def main():
    grants = read_json("data/grants.json")
    windows = read_json("data/grant-windows.json")
    watchlist = []

    for grant in grants:
        window = window_for(grant, windows)
        watchlist.append({
            "title": grant["name"],
            "priority": PRIORITY_BY_LEVEL.get(grant["level"], "Watch"),
            "summary": window["tip"],
            "level": grant["level"],
            "level_label": grant["level_label"],
            "window_type": window["window_type"],
            "action": window["action"],
            "source_url": grant["url"],
            "last_checked": grant["last_checked"],
        })

    watchlist.sort(key=lambda item: (
        LEVEL_ORDER.index(item["level"]) if item["level"] in LEVEL_ORDER else 99,
        item["title"],
    ))
    (ROOT / "data/grant-watchlist.json").write_text(json.dumps(watchlist, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(watchlist)} watchlist items.")


if __name__ == "__main__":
    main()
