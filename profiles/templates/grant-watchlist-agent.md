# Grant Watchlist Agent

Use this brief when an AI agent updates the Stradbroke Grants Lab watchlist and grant windows.

## Job

Refresh `data/grants.json`, `data/grant-windows.json` and the generated `data/grant-watchlist.json` for North Stradbroke Island / Minjerribah grant matching.

The watchlist is a triage layer, not a promise that an applicant is eligible.

## Cadence

- Run a light scan weekly.
- Run a deeper scan monthly.
- Run an urgent scan when a closing-soon grant, disaster activation or council round is discovered.

## Core Rule

Every grant record and window record must use a stable `source_key`.

Do not match windows by vague words such as "Queensland", "grant", "community" or "First Nations". That causes one grant's timing note to leak into unrelated programs.

Example:

- `gcbf` can say "Round 126 is closed".
- `qld-sport`, `arts-qld`, `business-gov` and `qra-resilience` must not inherit that GCBF round note.

## Source Order

Check primary sources first:

- GrantConnect for final Australian Government grant details.
- Community Grants Hub for accessible federal grant listings.
- business.gov.au for business and Indigenous business filters.
- Queensland Grants Finder and program pages for state grants.
- Redland City Council grant pages for council rounds.
- Indigenous.gov.au, NIAA, ORIC, QYAC-relevant and Queensland First Nations pages for First Nations pathways.
- Official UN, UNOPS, GEF or programme pages for global opportunities.

Use secondary sources only as leads. Do not treat them as final evidence.

## What To Capture

For each grant or source:

- name
- level
- source URL
- current status
- exact close date and time if open
- next opening date if announced
- applicant type
- project fit
- evidence needed
- cultural authority or governance checks
- reporting and acquittal obligations
- last checked date
- `source_key`

## Window Types

Use one of these where possible:

- `Open grant`
- `Closing soon`
- `Future round`
- `Rolling search`
- `Source watch`
- `Manual check`
- `Activated support`
- `Partnership watch`
- `Local support`

## Noticeboard Logic

A public notice should answer:

- who should care
- whether it is open, closing, future or only a source watch
- what is needed before drafting
- who is probably not eligible
- whether the deadline is realistic

Do not send whole-island panic notices for closing-soon grants. Target only likely eligible applicants.

## Update Steps

1. Check official source pages.
2. Update `data/grants.json` statuses, close dates, best-fit notes and `last_checked`.
3. Update or add matching `data/grant-windows.json` entries using exact `source_key`.
4. Run `python tools/build_watchlist.py`.
5. Run `python tools/validate_data.py`.
6. Preview `grant-watchlist.html` and `grant-windows.html`.
7. Commit with a short message that names the refresh date or major change.

## Safety Checks

- Round numbers belong only to the program that owns them.
- Closed grants should not be framed as open.
- Support information is not the same as project funding.
- First Nations grants require authority, eligibility and permission checks before drafting.
- Global grants usually need partnerships and long lead time.
- Council grants usually need insurance, quotes, budget, delivery plan and reporting capacity.
