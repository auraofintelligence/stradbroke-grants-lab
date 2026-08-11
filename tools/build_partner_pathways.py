import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIORITY = {"act_now": 0, "prepare_next": 1, "build_pathway": 2, "watch": 3}


def read_json(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def main():
    matches = read_json("data/grant-project-matches.json")
    projects = read_json("data/ledger-projects.json")
    current = read_json("data/partner-pathways.json")
    existing_by_project = {item["project_key"]: item for item in current}
    matches_by_project = {}
    for match in matches:
        matches_by_project.setdefault(match["project_key"], []).append(match)
    for items in matches_by_project.values():
        items.sort(key=lambda item: (PRIORITY.get(item["action_priority"], 9), item.get("action_by") or "9999-12-31"))

    pathways = []
    for project in projects:
        items = matches_by_project.get(project["project_key"], [])
        if not items:
            continue
        primary = items[0]
        existing = existing_by_project.get(project["project_key"], {})
        roles = []
        for role in primary.get("human_roles", []):
            if role not in roles:
                roles.append(role)
        pathways.append({
            "pathway_key": f"{primary['grant_source_key']}--{project['project_key']}--roles",
            "grant_source_key": primary["grant_source_key"],
            "project_key": project["project_key"],
            "planning_status": existing.get("planning_status", "research_only"),
            "roles_needed": roles or ["eligible legal applicant", "project authority", "delivery lead"],
            "candidate_partners": existing.get("candidate_partners", []),
            "boundary_note": existing.get("boundary_note", "The listed roles are planning needs. The island directory contains public research leads only; no organisation has been approached, approved or assigned to this project."),
            "last_checked": primary["last_checked"],
        })

    (ROOT / "data/partner-pathways.json").write_text(json.dumps(pathways, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(pathways)} project connection pathways.")


if __name__ == "__main__":
    main()
