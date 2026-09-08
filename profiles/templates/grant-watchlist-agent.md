# Grant Watchlist Agent

Use this brief when an AI agent updates the Stradbroke Grants Lab watchlist and grant windows.

## Job

Refresh `data/grants.json`, `data/grant-windows.json` and the generated `data/grant-watchlist.json` for North Stradbroke Island / Minjerribah grant matching. Sync `data/ledger-projects.json` from the Community Ledger plus the curated relevant 2026 Project Atlas scope, then place credible matches in `data/grant-project-matches.json` and cautious role planning in `data/partner-pathways.json`.

The watchlist is a triage layer, not a promise that an applicant is eligible.

## Cadence

- Run a light scan daily.
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
- Business Queensland, Queensland State Development and SEQ City Deal program pages for digital, infrastructure, connectivity, skills, jobs and regional initiatives.
- Redland City Council grant pages for council rounds.
- Indigenous.gov.au, NIAA, ORIC, QYAC-relevant and Queensland First Nations pages for First Nations pathways.
- Official UN, UNOPS, GEF or programme pages for global opportunities.
- Project Atlas for public projects with an evidenced original 2026 build date. Use `data/project-atlas-scope.json` to retain only direct Minjerribah, Point Lookout, Amity, Dunwich, Moreton Bay island-access or concrete local delivery connections.

Use secondary sources only as leads. Do not treat them as final evidence.

Do not limit the scan to programs already present in `data/grants.json`. Search current official announcement and application pages using the actual themes of every tracked project. Each daily scan must include a fresh check for digital/connectivity/jobs, infrastructure/resilience, First Nations, council, arts/media and environment opportunities.

## What To Capture

For each grant or source:

- name
- level
- source URL
- current status
- opportunity type: actual grant, closed grant, program directory, search portal, support information or partner watch
- funding amount or range as a prominent field, never buried only in prose
- exact close date and time if open
- next opening date if announced
- applicant type as a prominent field
- `availability`: `open`, `rolling`, `opening_soon`, `future`, `directory`, `support` or `closed`
- `deadline_date`: ISO date for reliable sorting, or `null` when no date is published
- project fit
- evidence needed
- cultural authority or governance checks
- reporting and acquittal obligations
- last checked date
- `source_key`

For directories and portals, use `Varies by program` rather than inventing a single amount. For support information or partner watches, use `Not applicable — not a grant`. Program-wide envelopes must be labelled as envelopes, not presented as the amount available to one local project.

## Project Matching

- Run `python tools/sync_ledger_projects.py` before matching.
- Use the exact `project_key` from `data/ledger-projects.json`.
- For Project Atlas additions, accept only entries whose `firstBuilt` date begins with `2026-`. Keep personal pages, private household demos, duplicate implementations, general navigation pages and unrelated global experiments out of the funding-search denominator.
- Use one fit status: `pursue`, `prepare`, `clarify`, `watch` or `do_not_pursue`.
- Record why the fit is credible, what eligibility remains unresolved and what evidence is needed.
- Do not force an unsuitable current grant onto a project. Every project still keeps a truthful pathway through a grant, tender, finance, fundraising or future-round lane, with the qualifying reframe and eligibility gates stated plainly.
- Keep the project idea separate from the legal applicant.

## Potential Connection Planning

- Plan roles before names: lead applicant, co-applicant, auspice, cultural authority, site or asset controller, delivery partner, supplier, supporter and beneficiary are distinct.
- Named organisations are source-backed research leads only.
- Use `not_contacted` unless a human has supplied evidence of a later assent stage.
- Do not contact anyone, send drafts or imply endorsement, eligibility, cultural authority, site control or agreement.
- Cultural authority and First Nations governance cannot be inferred from location, project topic or an organisation name.

## Window Types

Use one of these where possible:

- `Open grant`
- `Closing soon`
- `Future round`
- `Rolling search`
- `Source watch`
- `Manual check`
- `Activated support`
- `Potential connection watch`
- `Local support`

## Noticeboard Logic

A public notice should answer:

- who should care
- whether it is open, closing, future or only a source watch
- what is needed before drafting
- who is probably not eligible
- whether the deadline is realistic

## Project Funding Queue

Every tracked Community Ledger and selected Project Atlas 2026 project must keep at least one credible funding pathway. Do not discard a project because its current public framing is unusual: identify the smallest truthful reframe that makes its public benefit legible to a real grant or tender without changing its core intent.

Order project actions by:

1. open rounds and the earliest closing date
2. whether a legal applicant and required authority could realistically be assembled in time
3. funding range and the project's present readiness
4. future rounds that need evidence, confirmed roles, site control or quotes built now

Do not exclude small grants. Record their place in a funding stack, such as seed, planning, permissions, pilot, evidence, program delivery, equipment, capital infrastructure or scale. A grant does not need to cover the whole project cost. Describe a cautious co-funding path using possible resident or member fundraising, sponsorship, philanthropy, visitor giving, earned income and cash or in-kind support from organisations that later confirm a role, but never describe any contribution as secured without evidence.

Every `data/grant-project-matches.json` record must include:

- `action_priority`: `act_now`, `prepare_next`, `build_pathway` or `watch`
- `action_by`: an ISO closing/action date or `null`
- `stack_role`: what this money unlocks in the sequence
- `cofunding_plan`: possible complementary sources, with unsecured support clearly labelled
- `readiness_check`: the eligibility, authority, quote, site, budget or governance work that must be completed before proceeding
- `qualifying_reframe`: the smallest truthful reframe needed for fit
- `next_move`: the next human-checkable action
- `human_roles`: the people or accountable roles needed
- `ai_tasks`: research, drafting, evidence and coordination work AI can prepare for human approval

Do not send whole-island panic notices for closing-soon grants. Target only likely eligible applicants.

## Update Steps

1. Run `python tools/sync_ledger_projects.py`.
2. Check official source pages.
3. Update `data/grants.json` statuses, close dates, best-fit notes and `last_checked`.
4. Update or add matching `data/grant-windows.json` entries using exact `source_key`.
5. Update `data/grant-project-matches.json`.
6. Run `python tools/normalise_funding_stacks.py` so readiness work and possible co-funding remain distinct.
7. Run `python tools/build_partner_pathways.py` to keep role planning aligned without assigning organisations.
8. Run `python tools/build_watchlist.py`.
9. Run `python tools/validate_data.py`.
10. Preview the funding desk, project stacks and potential-connections pages.
11. Commit or publish only when the current task explicitly authorises it.

## Safety Checks

- Round numbers belong only to the program that owns them.
- Closed grants should not be framed as open.
- Support information is not the same as project funding.
- First Nations grants require authority, eligibility and permission checks before drafting.
- Global grants usually need confirmed delivery relationships and long lead time.
- Council grants usually need insurance, quotes, budget, delivery plan and reporting capacity.
