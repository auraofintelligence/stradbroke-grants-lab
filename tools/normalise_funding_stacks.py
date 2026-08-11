import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "data" / "grant-project-matches.json"
COFUNDING_WORDS = (
    "fundrais", "resident", "member", "sponsor", "visitor", "philanth",
    "in-kind", "earned income", "later grant",
)


def possible_stack(item):
    role = item["stack_role"].strip()
    lower = role.lower()
    if any(word in lower for word in ("capital", "equipment", "site", "infrastructure", "asset", "fixed")):
        return (
            f"This {role} can sit beside later capital or equipment grants, a resident and member campaign, "
            "local business sponsorship, visitor giving or major gifts, eligible applicant cash and verified "
            "in-kind site or technical support. Every layer is unconfirmed until evidenced."
        )
    if any(word in lower for word in ("program", "event", "screen", "content", "arts", "activity", "delivery", "pilot")):
        return (
            f"This {role} can be combined with memberships, ticket or earned income where eligible, resident "
            "fundraising, local sponsor cash or in-kind support, visitor giving, philanthropy and later program "
            "grants. Every layer is unconfirmed until evidenced."
        )
    return (
        f"Use this {role} to unlock later delivery grants, resident or member fundraising, local sponsorship, "
        "visitor giving and philanthropy, eligible applicant cash, earned income and verified in-kind support. "
        "Every layer is unconfirmed until evidenced."
    )


def main():
    matches = json.loads(PATH.read_text(encoding="utf-8"))
    changed = 0
    for item in matches:
        plan = item.get("cofunding_plan", "").strip()
        if "readiness_check" not in item:
            item["readiness_check"] = plan or item["next_move"]
            changed += 1
        if not any(word in plan.lower() for word in COFUNDING_WORDS):
            item["cofunding_plan"] = possible_stack(item)
            changed += 1
    PATH.write_text(json.dumps(matches, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Normalised {len(matches)} funding layers ({changed} field updates).")


if __name__ == "__main__":
    main()
