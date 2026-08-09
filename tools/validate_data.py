import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = {
    "data/grants.json": ["name", "level", "status", "best_for", "url", "last_checked", "source_key", "opportunity_type", "funding", "deadline", "applicants"],
    "data/entities.json": ["name", "category", "location", "status", "grant_fit", "place_area"],
    "data/projects.json": ["title", "domain", "summary", "grant_angles"],
    "data/source-docs.json": ["title", "type", "summary"],
    "data/grant-windows.json": ["source_key", "title", "window_type", "notify", "tip", "action", "source"],
    "data/grant-watchlist.json": ["title", "priority", "summary", "level", "level_label", "window_type", "action", "status", "source_key", "opportunity_type", "funding", "deadline", "applicants"],
    "data/ledger-projects.json": ["project_key", "title", "lane", "summary", "public_url", "source_page"],
}

OPTIONAL_LISTS = {
    "data/grant-project-matches.json": ["match_key", "grant_source_key", "project_key", "fit_status", "fit_reason", "eligibility_status", "evidence_needed", "last_checked"],
    "data/partner-pathways.json": ["pathway_key", "grant_source_key", "project_key", "planning_status", "roles_needed", "candidate_partners", "boundary_note", "last_checked"],
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
    for relative, fields in OPTIONAL_LISTS.items():
        path = ROOT / relative
        if not path.exists():
            fail(f"missing {relative}")
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            fail(f"{relative} is not valid JSON: {error}")
        if not isinstance(data, list):
            fail(f"{relative} must be a list")
        for index, item in enumerate(data, start=1):
            if not isinstance(item, dict):
                fail(f"{relative} item {index} is not an object")
            missing = [field for field in fields if field not in item or item[field] in ("", None)]
            if missing:
                fail(f"{relative} item {index} is missing {', '.join(missing)}")
    entity_names = [item["name"] for item in json.loads((ROOT / "data/entities.json").read_text(encoding="utf-8"))]
    duplicates = sorted({name for name in entity_names if entity_names.count(name) > 1})
    if duplicates:
        fail(f"data/entities.json has duplicate names: {', '.join(duplicates)}")
    allowed_place_areas = {"Dunwich / Goompi", "Amity / Pulan", "Point Lookout / Mulumba", "Other", "Unknown"}
    bad_place_areas = sorted({
        item["place_area"]
        for item in json.loads((ROOT / "data/entities.json").read_text(encoding="utf-8"))
        if item["place_area"] not in allowed_place_areas
    })
    if bad_place_areas:
        fail(f"data/entities.json has unsupported place_area values: {', '.join(bad_place_areas)}")
    grants = json.loads((ROOT / "data/grants.json").read_text(encoding="utf-8"))
    watchlist = json.loads((ROOT / "data/grant-watchlist.json").read_text(encoding="utf-8"))
    if len(watchlist) != len(grants):
        fail("data/grant-watchlist.json must be rebuilt from data/grants.json")
    grant_keys = {item["source_key"] for item in grants}
    window_keys = {item["source_key"] for item in json.loads((ROOT / "data/grant-windows.json").read_text(encoding="utf-8"))}
    missing_windows = sorted(grant_keys - window_keys)
    if missing_windows:
        fail(f"data/grants.json source_key values without matching grant window: {', '.join(missing_windows)}")
    watchlist_keys = {item["source_key"] for item in watchlist}
    if watchlist_keys != grant_keys:
        fail("data/grant-watchlist.json source_key values must match data/grants.json; rebuild the watchlist")
    ledger_projects = json.loads((ROOT / "data/ledger-projects.json").read_text(encoding="utf-8"))
    project_keys = [item["project_key"] for item in ledger_projects]
    duplicate_project_keys = sorted({key for key in project_keys if project_keys.count(key) > 1})
    if duplicate_project_keys:
        fail(f"data/ledger-projects.json has duplicate project keys: {', '.join(duplicate_project_keys)}")
    project_key_set = set(project_keys)
    matches = json.loads((ROOT / "data/grant-project-matches.json").read_text(encoding="utf-8"))
    allowed_fit_statuses = {"pursue", "prepare", "clarify", "watch", "do_not_pursue"}
    for item in matches:
        if item["project_key"] not in project_key_set:
            fail(f"grant match uses unknown project_key: {item['project_key']}")
        if item["grant_source_key"] not in grant_keys:
            fail(f"grant match uses unknown grant_source_key: {item['grant_source_key']}")
        if item["fit_status"] not in allowed_fit_statuses:
            fail(f"grant match uses unsupported fit_status: {item['fit_status']}")
        if not isinstance(item["evidence_needed"], list):
            fail(f"grant match evidence_needed must be a list: {item['match_key']}")
    pathways = json.loads((ROOT / "data/partner-pathways.json").read_text(encoding="utf-8"))
    allowed_planning_statuses = {"research_only", "needs_human_review", "approved_for_contact", "not_suitable"}
    allowed_assent_statuses = {"not_contacted", "conversation_only", "interested", "declined", "authorised"}
    required_candidate_fields = {"name", "proposed_role", "source_url", "assent_status", "eligibility_status", "authority_status", "notes"}
    for item in pathways:
        if item["project_key"] not in project_key_set:
            fail(f"partner pathway uses unknown project_key: {item['project_key']}")
        if item["grant_source_key"] not in grant_keys:
            fail(f"partner pathway uses unknown grant_source_key: {item['grant_source_key']}")
        if item["planning_status"] not in allowed_planning_statuses:
            fail(f"partner pathway uses unsupported planning_status: {item['planning_status']}")
        if not isinstance(item["roles_needed"], list) or not item["roles_needed"]:
            fail(f"partner pathway roles_needed must be a non-empty list: {item['pathway_key']}")
        if not isinstance(item["candidate_partners"], list):
            fail(f"partner pathway candidate_partners must be a list: {item['pathway_key']}")
        for candidate in item["candidate_partners"]:
            missing = sorted(field for field in required_candidate_fields if field not in candidate)
            if missing:
                fail(f"partner candidate is missing {', '.join(missing)} in {item['pathway_key']}")
            if candidate["assent_status"] not in allowed_assent_statuses:
                fail(f"partner candidate uses unsupported assent_status: {candidate['assent_status']}")
    print("Data validation passed.")


if __name__ == "__main__":
    main()
