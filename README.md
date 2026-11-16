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
- `data/grant-archive.json`: generated index of closed rounds and historical project research
- `data/entities.json`: public research leads for possible local connections; inclusion is not assent
- `data/projects.json`: earlier ideas and research, with links to current Ledger records where the relationship is documented
- `data/ledger-projects.json`: current Strange but True Community Ledger cards selected for Grants Lab, with geography and involvement
- `data/project-connections.json`: reviews of the work behind the cards, with public sources for each project and its connections
- `data/project-atlas-scope.json`: research tags and stable keys for existing Ledger projects
- `data/grant-project-matches.json`: reviewed grant-to-project research matches
- `data/partner-pathways.json`: generated role plans for individual project and funding pairs, with existing review notes and assent retained by pair
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
python tools/build_grant_archive.py
python tools/validate_data.py
```

The GitHub Action validates the checked-in data and checks that rebuilding the watchlist and role plans reproduces the published records.

## Watchlist Refresh

Use `profiles/templates/grant-watchlist-agent.md` as the agent brief for regular grant scans. It explains the source order, timing-window labels and the `source_key` rule that prevents one program's round status from leaking into unrelated grants.

Daily checks focus on deadlines and material status changes. The weekly refresh also reviews Community Ledger intake, records evidence-backed matches, and rebuilds the [grant archive](grant-archive.html). Projects without a credible match remain visible for research. Project participation invitations are explained on the [Take part page](participate.html).

Use the [project catalogue](ledger-projects.html) for current project URLs and the [funding desk](grant-watchlist.html) for grant sources. A reviewed match links one `project_key` to one exact `source_key`. Related editions, pilots and hubs have separate records, since applicant requirements and evidence can differ. The Lab's own Community Ledger entry identifies this tool and is excluded from the funding catalogue.

The Projects page starts with shared island tools and practical work on Straddie. The order within each group is the order of the reviewed profiles in `data/project-connections.json`. Long-term Straddie research sits under the long game. Work at other scales stays in the [Community Ledger](https://auraofintelligence.github.io/strange-but-true/community-ledger.html) and can still be reached through older direct links. The home page, funding overview and grant matches focus on local projects. A connection describes a shared tool, documented plan or possible use and carries its own source.

## Funding refresh history

The [1 November 2026 funding snapshot](data/history/2026-11-01-funding-refresh.json) preserves complete superseded grant, timing, project-match and partner-pathway records, with official verification sources and access limitations. Historical records are not active opportunities. Projects without a verified current grant retain clearly labelled, research-only local-support planning where appropriate; no support, eligibility or assent is implied.


## Site imagery

The full-width heroes are AI-generated landscapes inspired by Minjerribah. The inline photographs show actual locations. Sarah Barry’s [Point Lookout foreshore](https://commons.wikimedia.org/wiki/File:Point_Lookout,_North_Stradbroke_Island,_by_Sarah_Barry.jpg) is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), and Pacificwizard’s [Amity Point Jetty](https://commons.wikimedia.org/wiki/File:Amity_Point_Jetty_at_Sunset._North_Stradbroke_Island,_Queensland,_Australia.jpg) is [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The WebP copies are compressed and cropped for display. The photographs retain their own terms.

<details>
<summary>Hero image prompts</summary>

- [Home hero](assets/hero-home-2026.webp). Photorealistic editorial landscape for a website hero, very wide 2:1 panorama. Minjerribah / North Stradbroke Island inspired headland at blue hour, dark violet-grey coastal heath and cliffs in foreground, cyan ocean swell curving around to the right and warm gold light faintly visible on the horizon. Grounded South East Queensland coastal vegetation, spacious and quietly energising. Left third darker and calm, central visual anchor that survives a tall crop. No lettering, people, signage, map overlay, logos or watermark. A place-inspired illustration, no claim to depict a precise site.
- [Grants hero](assets/hero-grants-2026.webp). Photorealistic coastal editorial photograph for a grant directory hero, very wide 2:1 panorama. A Queensland bay viewed from near the shore at sunrise, shallow ripples leading toward a distant jetty silhouette and an open horizon, deep midnight purple shadows, bright true cyan water and muted gold dawn. Natural, clear, purposeful, with an uncluttered left third under text and an interesting central focal point for mobile crop. No lettering, logos, signage, people or watermark. Inspired by Minjerribah.
- [Projects hero](assets/hero-projects-2026.webp). Photorealistic coastal editorial photograph for a community project finder hero, very wide 2:1 panorama. Sandy walking track through windswept South East Queensland coastal banksia and pandanus toward a turquoise headland cove, early morning light with soft warm sand and violet shadows. Calm darker left third, pathway and vista in the central half for a mobile crop. Tangible ground textures, Minjerribah-inspired landscape, no lettering, people, logos, structures or watermark.

</details>

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

Each link below reflects an evidenced family, lineage or direct connection. This project has 16 relevant public connections.

### Direct and other supported connections

- [global-founder-atlas](https://github.com/auraofintelligence/global-founder-atlas) - [public page](https://auraofintelligence.github.io/global-founder-atlas/) - explicit cross-reference.
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

