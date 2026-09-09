# Stradbroke Grants Lab

A public-facing project-to-funding workbench for North Stradbroke Island / Minjerribah projects.

The goal is simple:

- map local businesses, non-profits, artists, clubs, health services, housing services, emergency services and community groups
- map Strange But True sample-world projects that could become grant applications
- keep a deadline-led funding desk and project funding stacks without excluding small amounts
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
- `data/entities.json`: public research leads for possible local connections; inclusion is not assent
- `data/projects.json`: Strange But True and island project ideas
- `data/ledger-projects.json`: generated copy of the public Community Ledger project cards
- `data/grant-project-matches.json`: reviewed grant-to-project research matches
- `data/partner-pathways.json`: role-based potential-connection planning with explicit assent boundaries
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
python tools/sync_ledger_projects.py
python tools/normalise_funding_stacks.py
python tools/build_partner_pathways.py
python tools/build_watchlist.py
python tools/validate_data.py
```

The GitHub Action runs the same check.

## Watchlist Refresh

Use `profiles/templates/grant-watchlist-agent.md` as the agent brief for regular grant scans. It explains the source order, timing-window labels and the `source_key` rule that prevents one program's round status from leaking into unrelated grants.

The weekly scan also refreshes the Community Ledger intake, keeps at least one truthful funding pathway for every project and prepares connection roles for human review. It must not contact anyone or imply eligibility, endorsement, authority, site control or assent.

## Entity Boundary

The entity catalogue is a public research and discovery layer, not consent, endorsement or a complete official directory. It currently imports the wider Straddie Noticeboard Network supposition layer and adds explicit health, housing, Elders and emergency service lanes for grant matching.

## Public readiness boundary

This workbench does not establish eligibility, partner assent, authority, capability, site control or funding readiness. These must be checked for each opportunity. It is not an official grant listing, funding approval or readiness assessment.

<!-- github-organisation:start -->

## Project links and history

- First substantive build: 6 May 2026.
- GitHub repository: [stradbroke-grants-lab](https://github.com/auraofintelligence/stradbroke-grants-lab).
- Public site: [visit the public site](https://auraofintelligence.github.io/stradbroke-grants-lab/).
- Strange But True Community Ledger: [browse the Community Ledger](https://auraofintelligence.github.io/strange-but-true/community-ledger.html).
- Straddie Noticeboard Network: [visit the public site](https://auraofintelligence.github.io/straddie-noticeboard-network/).

## Related public projects

Each link below reflects an evidenced family, lineage or direct connection. This project has 17 relevant public connections.

### Direct and other supported connections

- [global-founder-atlas](https://github.com/auraofintelligence/global-founder-atlas) - [public page](https://auraofintelligence.github.io/global-founder-atlas/) - explicit cross-reference.
- [straddie-vitality-network-builders](https://github.com/auraofintelligence/straddie-vitality-network-builders) - [public page](https://auraofintelligence.github.io/straddie-vitality-network-builders/) - explicit cross-reference.
- [strange-but-true](https://github.com/auraofintelligence/strange-but-true) - [public page](https://auraofintelligence.github.io/strange-but-true/) - explicit cross-reference.

### Funding, procurement and project-readiness workbenches

- [community-club-builder-sandy-sports](https://github.com/auraofintelligence/community-club-builder-sandy-sports) - [public page](https://auraofintelligence.github.io/community-club-builder-sandy-sports/) - explicit cross-reference, shared community programme, shared tooling suite.
- [legal-memory-workbench](https://github.com/auraofintelligence/legal-memory-workbench) - [public page](https://auraofintelligence.github.io/legal-memory-workbench/) - explicit cross-reference, shared tooling suite.
- [moreton-bay-autonomous-mobility](https://github.com/auraofintelligence/moreton-bay-autonomous-mobility) - [public page](https://auraofintelligence.github.io/moreton-bay-autonomous-mobility/) - explicit cross-reference, shared tooling suite.
- [ready-set-co-op-trust-hub](https://github.com/auraofintelligence/ready-set-co-op-trust-hub) - [public page](https://auraofintelligence.github.io/ready-set-co-op-trust-hub/) - shared community programme, shared tooling suite.
- [straddie-tenders-lab](https://github.com/auraofintelligence/straddie-tenders-lab) - [public page](https://auraofintelligence.github.io/straddie-tenders-lab/) - explicit cross-reference, shared tooling suite.
- [windemere-skate-bowl-tender-workspace](https://github.com/auraofintelligence/windemere-skate-bowl-tender-workspace) - [public page](https://auraofintelligence.github.io/windemere-skate-bowl-tender-workspace/) - explicit cross-reference, shared tooling suite.

### Island publication and community operations

- [ballow-road-sand-screen-hub](https://github.com/auraofintelligence/ballow-road-sand-screen-hub) - [public page](https://auraofintelligence.github.io/ballow-road-sand-screen-hub/) - shared community programme.
- [ready-set-co-op-hyperlocal-media](https://github.com/auraofintelligence/ready-set-co-op-hyperlocal-media) - [public page](https://auraofintelligence.github.io/ready-set-co-op-hyperlocal-media/) - shared community programme.
- [shared-table-initiative](https://github.com/auraofintelligence/shared-table-initiative) - [public page](https://auraofintelligence.github.io/shared-table-initiative/) - explicit cross-reference, shared community programme.
- [straddie-content-assets-kit](https://github.com/auraofintelligence/straddie-content-assets-kit) - [public page](https://auraofintelligence.github.io/straddie-content-assets-kit/) - explicit cross-reference, shared community programme.
- [straddie-disaster-kiosks](https://github.com/auraofintelligence/straddie-disaster-kiosks) - [public page](https://auraofintelligence.github.io/straddie-disaster-kiosks/) - shared community programme.
- [straddie-news](https://github.com/auraofintelligence/straddie-news) - [public page](https://auraofintelligence.github.io/straddie-news/) - shared community programme.
- [straddie-night-market-lab](https://github.com/auraofintelligence/straddie-night-market-lab) - [public page](https://auraofintelligence.github.io/straddie-night-market-lab/) - shared community programme.
- [straddie-noticeboard-network](https://github.com/auraofintelligence/straddie-noticeboard-network) - [public page](https://auraofintelligence.github.io/straddie-noticeboard-network/) - explicit cross-reference, shared community programme.

<!-- github-organisation:end -->
