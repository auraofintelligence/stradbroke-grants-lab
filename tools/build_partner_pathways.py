import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_json(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def main():
    matches = read_json("data/grant-project-matches.json")
    projects = read_json("data/ledger-projects.json")
    current = read_json("data/partner-pathways.json")
    existing_by_match = {(item["project_key"], item["grant_source_key"]): item for item in current}
    matches_by_project = {}
    for match in matches:
        matches_by_project.setdefault(match["project_key"], []).append(match)

    pathways = []
    for project in projects:
        project_key = project["project_key"]
        for match in matches_by_project.get(project_key, []):
            grant_key = match["grant_source_key"]
            existing = existing_by_match.get((project_key, grant_key), {})
            roles = list(dict.fromkeys(match["human_roles"]))
            pathways.append({
                "pathway_key": f"{match['match_key']}--roles",
                "grant_source_key": grant_key,
                "project_key": project_key,
                "planning_status": existing.get("planning_status", "research_only"),
                "roles_needed": roles,
                "candidate_partners": existing.get("candidate_partners", []),
                "boundary_note": existing.get("boundary_note", "The listed roles are planning needs. The island directory contains public research leads only; no organisation has been approached, approved or assigned to this project."),
                "last_checked": existing.get("last_checked", match["last_checked"]),
            })

    (ROOT / "data/partner-pathways.json").write_text(json.dumps(pathways, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(pathways)} project connection pathways.")


if __name__ == "__main__":
    main()
