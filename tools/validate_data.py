import json
from collections import Counter
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = {
    "data/grants.json": ["name", "level", "level_label", "status", "best_for", "url", "last_checked", "source_key", "opportunity_type", "funding", "deadline", "applicants", "availability"],
    "data/entities.json": ["name", "category", "location", "status", "grant_fit", "place_area"],
    "data/projects.json": ["title", "domain", "summary", "grant_angles"],
    "data/project-atlas-scope.json": ["atlas_name", "project_key", "lane", "grant_angles", "selection_reason"],
    "data/source-docs.json": ["title", "type", "summary"],
    "data/grant-windows.json": ["source_key", "title", "window_type", "notify", "tip", "action", "source"],
    "data/grant-watchlist.json": ["title", "priority", "summary", "level", "level_label", "window_type", "action", "status", "source_key", "opportunity_type", "funding", "deadline", "applicants", "availability"],
    "data/grant-archive.json": ["name", "source_key", "opportunity_type", "availability", "url"],
    "data/ledger-projects.json": ["project_key", "title", "lane", "summary", "public_url", "source_page", "source_type"],
}

OPTIONAL_LISTS = {
    "data/grant-project-matches.json": ["match_key", "grant_source_key", "project_key", "fit_status", "fit_reason", "eligibility_status", "evidence_needed", "last_checked"],
    "data/partner-pathways.json": ["pathway_key", "grant_source_key", "project_key", "planning_status", "roles_needed", "candidate_partners", "boundary_note", "last_checked"],
}

MATCH_ACTION_FIELDS = ["action_priority", "stack_role", "cofunding_plan", "readiness_check", "qualifying_reframe", "next_move", "human_roles", "ai_tasks"]


def fail(message):
    raise SystemExit(f"Data validation failed: {message}")


def indexed(records, field, label):
    duplicates = [key for key, count in Counter(item[field] for item in records).items() if count > 1]
    if duplicates:
        fail(f"{label} has duplicate {field} values: {', '.join(sorted(duplicates))}")
    return {item[field]: item for item in records}


def validate_project_connections(project_keys):
    relative = "data/project-connections.json"
    try:
        review = json.loads((ROOT / relative).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"could not read {relative}: {error}")
    if not isinstance(review, dict):
        fail(f"{relative} must contain profiles and connections")

    for section, fields in (
        ("profiles", ("project_key", "group", "summary", "source_url")),
        ("connections", ("from", "to", "kind", "note", "source_url")),
    ):
        records = review.get(section)
        if not isinstance(records, list):
            fail(f"{relative} {section} must be a list")
        for index, record in enumerate(records, 1):
            if not isinstance(record, dict) or any(
                not isinstance(record.get(field), str) or not record[field].strip() for field in fields
            ):
                fail(f"{relative} {section} item {index} has incomplete fields")
            source = urlsplit(record["source_url"])
            if source.scheme != "https" or not source.netloc:
                fail(f"{relative} {section} item {index} needs a public HTTPS source")

    profiles = indexed(review["profiles"], "project_key", relative)
    for key, record in profiles.items():
        if key not in project_keys or record["group"] not in {"shared", "local", "wider", "reference"}:
            fail(f"{relative} has an unknown project or group: {key}")
    pairs = set()
    for record in review["connections"]:
        pair = frozenset((record["from"], record["to"]))
        if len(pair) != 2 or not pair <= profiles.keys() or pair in pairs:
            fail(f"{relative} has an unknown, repeated or self-linked project pair: {record['from']} / {record['to']}")
        if record["kind"] not in {"documented", "possible"}:
            fail(f"{relative} has an unknown connection type: {record['kind']}")
        pairs.add(pair)


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
    windows = json.loads((ROOT / "data/grant-windows.json").read_text(encoding="utf-8"))
    allowed_availability = {"open", "rolling", "opening_soon", "future", "directory", "support", "closed"}
    allowed_opportunity_types = {"grant", "program_list", "search_portal", "support_information", "partner_watch", "finance", "tender", "fundraising"}
    today = datetime.now(timezone(timedelta(hours=10))).date()
    for label, records in (("data/grants.json", grants), ("data/grant-watchlist.json", watchlist)):
        for item in records:
            if "deadline_date" not in item:
                fail(f"{label} item {item.get('source_key', 'unknown')} is missing deadline_date")
            if item["availability"] not in allowed_availability:
                fail(f"{label} uses unsupported availability: {item['availability']}")
            if item["opportunity_type"] not in allowed_opportunity_types:
                fail(f"{label} uses unsupported opportunity_type: {item['opportunity_type']}")
            if item["deadline_date"] is not None:
                try:
                    date.fromisoformat(item["deadline_date"])
                except (TypeError, ValueError):
                    fail(f"{label} deadline_date must be an ISO date or null: {item.get('source_key', 'unknown')}")
    grants_by_key = indexed(grants, "source_key", "data/grants.json")
    windows_by_key = indexed(windows, "source_key", "data/grant-windows.json")
    watchlist_by_key = indexed(watchlist, "source_key", "data/grant-watchlist.json")
    grant_keys = grants_by_key.keys()
    if windows_by_key.keys() != grant_keys:
        fail("data/grant-windows.json source_key values must match data/grants.json")
    if watchlist_by_key.keys() != grant_keys:
        fail("data/grant-watchlist.json source_key values must match data/grants.json; rebuild the watchlist")
    shared_fields = ("level", "level_label", "last_checked", "status", "opportunity_type", "funding",
                     "deadline", "deadline_date", "applicants", "availability")
    for key, grant in grants_by_key.items():
        watch = watchlist_by_key[key]
        window = windows_by_key[key]
        expected = {field: grant[field] for field in shared_fields}
        expected.update(title=grant["name"], source_url=grant["url"], window_type=window["window_type"],
                        summary=window["tip"], action=window["action"])
        if any(watch.get(field) != value for field, value in expected.items()):
            fail(f"watchlist data is stale for {key}; rebuild the watchlist")
    ledger_projects = json.loads((ROOT / "data/ledger-projects.json").read_text(encoding="utf-8"))
    atlas_scope = json.loads((ROOT / "data/project-atlas-scope.json").read_text(encoding="utf-8"))
    atlas_names = [item["atlas_name"] for item in atlas_scope]
    duplicate_atlas_names = sorted({name for name in atlas_names if atlas_names.count(name) > 1})
    if duplicate_atlas_names:
        fail(f"data/project-atlas-scope.json has duplicate atlas names: {', '.join(duplicate_atlas_names)}")
    scoped_project_keys = [item["project_key"] for item in atlas_scope]
    duplicate_scoped_project_keys = sorted({key for key in scoped_project_keys if scoped_project_keys.count(key) > 1})
    if duplicate_scoped_project_keys:
        fail(f"data/project-atlas-scope.json has duplicate project keys: {', '.join(duplicate_scoped_project_keys)}")
    for item in atlas_scope:
        if not isinstance(item["grant_angles"], list) or not item["grant_angles"]:
            fail(f"Project Atlas scope grant_angles must be a non-empty list: {item['atlas_name']}")
    projects_by_key = indexed(ledger_projects, "project_key", "data/ledger-projects.json")
    project_key_set = projects_by_key.keys()
    validate_project_connections(project_key_set)
    project_urls = set()
    for item in ledger_projects:
        if item["source_type"] != "community_ledger":
            fail(f"current project must come from the Community Ledger: {item['project_key']}")
        url = item["public_url"].rstrip("/").casefold()
        if url in project_urls:
            fail(f"multiple current projects share the same page: {item['public_url']}")
        parts = urlsplit(url)
        if parts.netloc == "auraofintelligence.github.io" and parts.path.strip("/").split("/")[0] == "stradbroke-grants-lab":
            fail(f"project page loops back to the Grants Lab: {item['project_key']}")
        project_urls.add(url)
    background_projects = json.loads((ROOT / "data/projects.json").read_text(encoding="utf-8"))
    for item in background_projects:
        related = item.get("ledger_project_keys", [])
        if not isinstance(related, list) or any(key not in project_key_set for key in related):
            fail(f"historical project uses an unknown current project key: {item['title']}")
        if len(related) != len(set(related)):
            fail(f"historical project repeats a current project key: {item['title']}")
    matches = json.loads((ROOT / "data/grant-project-matches.json").read_text(encoding="utf-8"))
    indexed(matches, "match_key", "data/grant-project-matches.json")
    allowed_fit_statuses = {"pursue", "prepare", "clarify", "watch", "do_not_pursue"}
    allowed_action_priorities = {"act_now", "prepare_next", "build_pathway", "watch"}
    for item in matches:
        expected_key = f"{item['grant_source_key']}--{item['project_key']}"
        if item["match_key"] != expected_key:
            fail(f"grant match key must identify its exact grant and project: {item['match_key']}")
        if item["project_key"] not in project_key_set:
            fail(f"grant match uses unknown project_key: {item['project_key']}")
        if item["grant_source_key"] not in grant_keys:
            fail(f"grant match uses unknown grant_source_key: {item['grant_source_key']}")
        matched_grant = grants_by_key[item["grant_source_key"]]
        if matched_grant["availability"] == "closed":
            fail(f"grant match uses a closed funding pathway: {item['match_key']}")
        matched_deadline = matched_grant.get("deadline_date")
        if matched_deadline is not None and date.fromisoformat(matched_deadline) < today:
            fail(f"grant match uses an expired funding pathway: {item['match_key']}")
        if item["fit_status"] not in allowed_fit_statuses:
            fail(f"grant match uses unsupported fit_status: {item['fit_status']}")
        missing_action_fields = [field for field in MATCH_ACTION_FIELDS if field not in item or item[field] in ("", None)]
        if missing_action_fields:
            fail(f"grant match is missing action fields {', '.join(missing_action_fields)}: {item['match_key']}")
        if item["action_priority"] not in allowed_action_priorities:
            fail(f"grant match uses unsupported action_priority: {item['action_priority']}")
        if item.get("action_by") is not None:
            try:
                action_by = date.fromisoformat(item["action_by"])
            except (TypeError, ValueError):
                fail(f"grant match action_by must be an ISO date or null: {item['match_key']}")
            if action_by < today:
                fail(f"grant match action_by date has passed: {item['match_key']}")
        if not isinstance(item["evidence_needed"], list):
            fail(f"grant match evidence_needed must be a list: {item['match_key']}")
        for field in ("human_roles", "ai_tasks"):
            if not isinstance(item[field], list) or not item[field]:
                fail(f"grant match {field} must be a non-empty list: {item['match_key']}")
        cofunding_terms = ("fundrais", "resident", "member", "sponsor", "visitor", "philanth", "in-kind", "earned income", "later grant")
        if not any(term in item["cofunding_plan"].lower() for term in cofunding_terms):
            fail(f"grant match cofunding_plan does not describe a real possible funding mix: {item['match_key']}")
    # The discovery catalogue can contain ideas whose funding fit still needs review.
    pathways = json.loads((ROOT / "data/partner-pathways.json").read_text(encoding="utf-8"))
    pathways_by_key = indexed(pathways, "pathway_key", "data/partner-pathways.json")
    expected_pathway_keys = {f"{match['match_key']}--roles" for match in matches}
    if pathways_by_key.keys() != expected_pathway_keys:
        fail("connection pathways must match reviewed project/grant pairs; rebuild the connection pathways")
    allowed_planning_statuses = {"research_only", "needs_human_review", "approved_for_contact", "not_suitable"}
    allowed_assent_statuses = {"not_contacted", "conversation_only", "interested", "declined", "authorised"}
    required_candidate_fields = {"name", "proposed_role", "source_url", "assent_status", "eligibility_status", "authority_status", "notes"}
    for item in pathways:
        if item["pathway_key"] != f"{item['grant_source_key']}--{item['project_key']}--roles":
            fail(f"connection pathway key must identify its exact grant and project: {item['pathway_key']}")
        if item["project_key"] not in project_key_set:
            fail(f"partner pathway uses unknown project_key: {item['project_key']}")
        if item["grant_source_key"] not in grant_keys:
            fail(f"partner pathway uses unknown grant_source_key: {item['grant_source_key']}")
        pathway_grant = grants_by_key[item["grant_source_key"]]
        if pathway_grant["availability"] == "closed":
            fail(f"partner pathway uses a closed funding source: {item['pathway_key']}")
        pathway_deadline = pathway_grant.get("deadline_date")
        if pathway_deadline is not None and date.fromisoformat(pathway_deadline) < today:
            fail(f"partner pathway uses an expired funding source: {item['pathway_key']}")
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
