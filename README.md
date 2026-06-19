# Stradbroke Grants Lab

A public-facing grant research and preparation site for North Stradbroke Island / Minjerribah projects.

The goal is simple:

- map local businesses, non-profits, artists, clubs, health services, housing services, emergency services and community groups
- map Strange But True sample-world projects that could become grant applications
- keep a live watchlist of grant programs by level
- publish grant-window notices for new, closing and future rounds
- create small markdown profile files that AI agents can use to draft grant applications quickly
- keep checks and balances for budgets, milestones, reporting and acquittals

## Local Preview

From this folder:

```powershell
python -m http.server 4180
```

Then open:

```text
http://localhost:4180/
```

## Data Files

- `data/grants.json`: grant programs and search portals
- `data/grant-watchlist.json`: generated shortlist from grant sources and window hints
- `data/entities.json`: island businesses, groups, artists and other possible applicants
- `data/projects.json`: Strange But True and island project ideas
- `data/source-docs.json`: summaries of the supplied research documents
- `data/grant-windows.json`: noticeboard-ready grant timing hints

## Profile Kit

Use `profiles/templates/` to make reusable markdown packs for grant drafting:

- `business-profile.md`
- `aura.md`
- `noticeboard.md`
- `grant-readiness-checklist.md`
- `milestone-report.md`
- `grant-notice.md`
- `grant-watchlist-agent.md`

## Validation

Run:

```powershell
python tools/build_watchlist.py
python tools/validate_data.py
```

The GitHub Action runs the same check.

## Watchlist Refresh

Use `profiles/templates/grant-watchlist-agent.md` as the agent brief for regular grant scans. It explains the source order, timing-window labels and the `source_key` rule that prevents one program's round status from leaking into unrelated grants.

## Entity Boundary

The entity catalogue is a public research and discovery layer, not consent, endorsement or a complete official directory. It currently imports the wider Straddie Noticeboard Network supposition layer and adds explicit health, housing, Elders and emergency service lanes for grant matching.
