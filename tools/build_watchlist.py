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

AVAILABILITY_ORDER = ["open", "rolling", "opening_soon", "future", "directory", "support", "closed"]


def read_json(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def window_for(grant, windows):
    source_key = grant.get("source_key")
    if source_key:
        for window in windows:
            if window.get("source_key") == source_key:
                return window
    return {
        "window_type": "Source watch",
        "action": "Check current round, eligibility, deadline, evidence and reporting duties before drafting.",
        "tip": grant["best_for"],
        "source": grant["name"],
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
            "status": grant["status"],
            "source_key": grant.get("source_key", ""),
            "opportunity_type": grant["opportunity_type"],
            "funding": grant["funding"],
            "deadline": grant["deadline"],
            "applicants": grant["applicants"],
            "availability": grant["availability"],
            "deadline_date": grant.get("deadline_date"),
        })

    watchlist.sort(key=lambda item: (
        AVAILABILITY_ORDER.index(item["availability"]) if item["availability"] in AVAILABILITY_ORDER else 99,
        item["deadline_date"] or "9999-12-31",
        item["title"],
    ))
    (ROOT / "data/grant-watchlist.json").write_text(json.dumps(watchlist, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(watchlist)} watchlist items.")


if __name__ == "__main__":
    main()
