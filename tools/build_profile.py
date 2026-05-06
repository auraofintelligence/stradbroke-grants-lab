import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "profiles" / "templates"


def main():
    parser = argparse.ArgumentParser(description="Create a grant profile pack from the starter templates.")
    parser.add_argument("name", help="Folder name for the applicant or project profile.")
    args = parser.parse_args()

    safe_name = "".join(ch.lower() if ch.isalnum() else "-" for ch in args.name).strip("-")
    target = ROOT / "profiles" / safe_name
    target.mkdir(parents=True, exist_ok=True)

    for template in TEMPLATES.glob("*.md"):
        output = target / template.name
        if not output.exists():
            output.write_text(template.read_text(encoding="utf-8"), encoding="utf-8")

    print(f"Profile pack ready: {target}")


if __name__ == "__main__":
    main()
