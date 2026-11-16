const navHtml = `
  <nav class="nav" aria-label="Main navigation">
    <a class="brand-mark" href="index.html"><span>Stradbroke</span><span>Grants Lab</span></a>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="ledger-projects.html">Projects</a>
      <a href="grant-watchlist.html">Grants</a>
      <a href="participate.html">Take part</a>
    </div>
  </nav>`;

const footerHtml = `
  <div class="footer-inner">
    <div><p class="eyebrow">Minjerribah / North Stradbroke Island</p><strong>Stradbroke Grants Lab</strong><p>A project and funding workbench from Luke Nathan Hayes.</p></div>
    <nav aria-label="Footer navigation"><a href="grant-archive.html">Past grant rounds</a><a href="resources.html">Resources</a><a href="profile-kit.html">Readiness kit</a><a href="workflow.html">How the Lab works</a><a href="sitemap.html">Site map</a><a href="https://auraofintelligence.github.io/strange-but-true/community-ledger.html">Community Ledger</a></nav>
  </div>`;

document.querySelectorAll(".site-header").forEach((header) => {
  if (!header.children.length) header.innerHTML = navHtml;
});
document.querySelectorAll(".site-footer").forEach((footer) => {
  if (!footer.children.length) footer.innerHTML = footerHtml;
});

const currentFile = window.location.pathname.split("/").pop() || "index.html";
const sectionLanding = {
  "grant-matches": "ledger-projects.html",
  "partner-pathways": "ledger-projects.html",
  projects: "ledger-projects.html",
  grants: "grant-watchlist.html",
  windows: "grant-watchlist.html",
  archive: "grant-watchlist.html",
};
document.querySelectorAll(".nav-links a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentFile) link.setAttribute("aria-current", "page");
  else if (href === sectionLanding[document.body.dataset.page]) link.setAttribute("aria-current", "location");
});

const topButton = document.querySelector("[data-to-top]");
if (topButton) {
  const updateTopButton = () => topButton.classList.toggle("is-visible", window.scrollY > 560);
  updateTopButton();
  window.addEventListener("scroll", updateTopButton, { passive: true });
  topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sentenceList(items, fallback = "Not yet assigned") {
  return Array.isArray(items) && items.length ? items.join("; ") : fallback;
}

function deadlineTime(item) {
  return item.deadline_date ? Date.parse(item.deadline_date) : Number.POSITIVE_INFINITY;
}

const brisbaneToday = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString().slice(0, 10);

function isClosedRound(item) {
  return item.availability === "closed" || Boolean(item.deadline_date && item.deadline_date < brisbaneToday);
}

function isOpenGrant(grant) {
  return grant.opportunity_type === "grant" && ["open", "rolling"].includes(grant.availability) && !isClosedRound(grant);
}

function projectHref(key) {
  return `ledger-projects.html#ledger-${key}`;
}

function grantHref(key) {
  return `grant-watchlist.html#grant-${key}`;
}

function stackHref(projectKey, matchKey) {
  return matchKey ? `grant-matches.html#match-${matchKey}` : `grant-matches.html#project-${projectKey}`;
}

function activeMatches(matches, projects, grants) {
  return matches.filter((match) => {
    const grant = grants.get(match.grant_source_key);
    return projects.has(match.project_key) && grant && !isClosedRound(grant);
  });
}

function revealLinkedRecord() {
  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return;
  const details = target.closest("details");
  if (details) details.open = true;
  (target.closest(".funding-stack-card") || target).scrollIntoView();
}

function card(title, tag, body, meta, url, actions = [], id = "", className = "") {
  const fallbackAction = url ? [{ label: "Open source", url }] : [];
  const actionItems = [...fallbackAction, ...actions].filter((action) => action && action.url);
  const actionLinks = actionItems.length
    ? `<div class="card-actions">${actionItems.map((action) => {
      const external = /^https?:\/\//i.test(action.url);
      return `<a href="${escapeHtml(action.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(action.label)}</a>`;
    }).join("")}</div>`
    : "";
  const anchor = id ? ` id="${escapeHtml(id)}"` : "";
  const classes = className ? ` ${className}` : "";
  return `<article class="data-card${classes}"${anchor}><p class="tag">${escapeHtml(tag || "Item")}</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>${meta ? `<div class="meta">${meta}</div>` : ""}${actionLinks}</article>`;
}

function grantFacts(grant, extraFacts = []) {
  const facts = grant ? [
    ["Funding", grant.funding],
    ["Deadline", grant.deadline],
    ["Who can apply", grant.applicants],
    ["Type", opportunityTypeLabel(grant.opportunity_type)],
    ...extraFacts,
  ] : extraFacts;
  if (!facts.length) return "Grant details unavailable";
  return `<dl class="card-facts">${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
}

function unique(items) {
  return [...new Set(items)].filter(Boolean).sort();
}

function availabilityLabel(value) {
  return ({ open: "Open now", rolling: "Rolling", opening_soon: "Opening soon", future: "Prepare", closed: "Past round", directory: "Source library", support: "Support information" })[value] || "Check status";
}

function opportunityTypeLabel(value) {
  return ({ grant: "Grant opportunity", program_list: "Program list", search_portal: "Search portal", support_information: "Support information", partner_watch: "Potential support watch", finance: "Finance pathway", tender: "Tender pathway", fundraising: "Fundraising pathway" })[value] || String(value || "Funding source").replaceAll("_", " ");
}

function formatActionDate(value) {
  if (!value) return "No fixed action date";
  const parsed = Date.parse(`${value}T12:00:00+10:00`);
  return Number.isFinite(parsed) ? new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Brisbane" }).format(parsed) : value;
}

function renderFilters(container, labels, onSelect) {
  if (!container) return;
  container.innerHTML = ["All", ...labels].map((label, index) => `<button type="button" class="${index === 0 ? "is-active" : ""}" data-filter="${label}">${label}</button>`).join("");
  container.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    container.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
    onSelect(button.dataset.filter);
  });
}

function value(form, name) {
  return (new FormData(form).get(name) || "").toString().trim();
}

function section(title, body, fallback = "") {
  const content = body || fallback;
  return `## ${title}\n\n${content}\n`;
}

function checkboxLines(items) {
  return items.map((item) => `- [ ] ${item}`).join("\n");
}

function markdownBuilders(type, form) {
  if (type === "business-profile") {
    return {
      filename: "business-profile.md",
      markdown: [
        "# Business / Organisation Profile",
        "",
        "Use this file to give an AI agent the basic truth before drafting a grant.",
        "",
        section("Public Name", value(form, "publicName")),
        section("Legal Name", value(form, "legalName")),
        section("ABN / ACN", value(form, "abn")),
        section("Entity Type", value(form, "entityType"), "Examples: sole trader, company, incorporated association, charity, auspiced group, informal community group."),
        section("Contact Person", value(form, "contactPerson")),
        section("Location", value(form, "location")),
        section("Website / Social Links", value(form, "links")),
        section("Public Summary", value(form, "summary"), "Short plain-English summary of who this applicant is and who they help."),
        section("Community Benefit", value(form, "benefit"), "Who benefits, how they benefit, and why this matters locally."),
        section("Experience", value(form, "experience"), "Past projects, events, services, partnerships or delivery evidence."),
        section("Insurance / Compliance", value(form, "compliance"), "Public liability, worker safety, permits, food safety, child safety, cultural permissions, privacy notes."),
        section("Grant Restrictions", value(form, "restrictions"), "Anything the applicant cannot or should not claim."),
        section("Private Notes", value(form, "privateNotes"), "Keep this section out of public pages unless deliberately approved."),
      ].join("\n").trim() + "\n",
    };
  }
  if (type === "grant-readiness") {
    return {
      filename: "grant-readiness.md",
      markdown: [
        "# Grant Readiness",
        "",
        section("Grant", value(form, "grant")),
        section("Deadline", value(form, "deadline")),
        section("Applicant", value(form, "applicant")),
        section("Project", value(form, "project")),
        section("Eligibility Notes", value(form, "eligibility"), checkboxLines([
          "Applicant type is eligible.",
          "Project location is eligible.",
          "Project timing is eligible.",
          "Requested items are eligible.",
          "No duplicate funding problem.",
          "Auspice is arranged if needed.",
        ])),
        section("Evidence Already Ready", value(form, "evidenceReady")),
        section("Evidence Still Needed", value(form, "evidenceNeeded"), checkboxLines([
          "Quotes are collected.",
          "Budget balances.",
          "Timeline is realistic.",
          "Letters of support are ready.",
          "Risk management is included.",
        ])),
        section("Budget / Quotes", value(form, "budget")),
        section("Permissions / Cultural Authority", value(form, "permissions")),
        section("Risks and Checks", value(form, "risks"), checkboxLines([
          "No over-claiming.",
          "Cultural authority is respected.",
          "Privacy boundary is clear.",
          "Reporting duties are understood.",
        ])),
        section("Reporting / Acquittal Duties", value(form, "reporting"), "Acquittal evidence can be collected during delivery."),
      ].join("\n").trim() + "\n",
    };
  }
  return {
    filename: "milestone-report.md",
    markdown: [
      "# Milestone Report",
      "",
      section("Grant", value(form, "grant")),
      section("Project", value(form, "project")),
      section("Reporting Period", value(form, "period")),
      section("Prepared By", value(form, "preparedBy")),
      section("What Was Planned", value(form, "planned")),
      section("What Happened", value(form, "happened")),
      section("Budget Update", value(form, "budget")),
      section("Evidence Collected", value(form, "evidence"), "Links, photos, invoices, attendance, feedback, delivery notes."),
      section("Changes / Variations", value(form, "changes")),
      section("Risks / Issues", value(form, "risks")),
      section("Next Milestone", value(form, "next")),
      section("Acquittal Notes", value(form, "acquittal")),
    ].join("\n").trim() + "\n",
  };
}

function downloadMarkdown(filename, markdown) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderProfileKit() {
  document.querySelectorAll("[data-md-generator]").forEach((panel) => {
    const form = panel.querySelector("form");
    const preview = panel.querySelector("[data-md-preview]");
    const generate = panel.querySelector("[data-generate-md]");
    const download = panel.querySelector("[data-download-md]");
    let latest = "";
    let filename = "profile.md";
    if (!form || !preview || !generate || !download) return;
    generate.addEventListener("click", () => {
      const built = markdownBuilders(panel.dataset.mdGenerator, form);
      latest = built.markdown;
      filename = built.filename;
      preview.textContent = latest;
      download.disabled = false;
      download.textContent = `Export ${filename}`;
    });
    download.addEventListener("click", () => {
      if (latest) downloadMarkdown(filename, latest);
    });
  });
}

async function renderHome() {
  const [grants, projects, matches] = await Promise.all([
    loadJson("data/grants.json"),
    loadJson("data/ledger-projects.json"),
    loadJson("data/grant-project-matches.json"),
  ]);
  const projectByKey = new Map(projects.map((project) => [project.project_key, project]));
  const openGrants = new Map(grants
    .filter(isOpenGrant)
    .map((grant) => [grant.source_key, grant]));
  const dateToAct = (match) => {
    const closes = openGrants.get(match.grant_source_key).deadline_date || "9999-12-31";
    return match.action_by && match.action_by < closes ? match.action_by : closes;
  };
  const ordered = activeMatches(matches, projectByKey, openGrants)
    .filter((match) => match.fit_status !== "do_not_pursue" && dateToAct(match) >= brisbaneToday)
    .sort((a, b) => dateToAct(a).localeCompare(dateToAct(b)));
  const firstByProject = new Map();
  for (const match of ordered) {
    if (!firstByProject.has(match.project_key)) firstByProject.set(match.project_key, match);
  }
  document.querySelector("#homeOpenMatches").innerHTML = [...firstByProject.values()].slice(0, 2).map((match) => {
    const project = projectByKey.get(match.project_key);
    const grant = openGrants.get(match.grant_source_key);
    const earlierAction = match.action_by && (!grant.deadline_date || match.action_by < grant.deadline_date);
    const timing = earlierAction ? `Act by ${formatActionDate(match.action_by)}`
      : grant.deadline_date ? `Closes ${formatActionDate(grant.deadline_date)}` : "Open on a rolling basis";
    return `<article class="data-card">
      <p class="tag">${escapeHtml(timing)}</p>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(grant.name)}</p>
      <a class="text-link" href="${escapeHtml(stackHref(project.project_key, match.match_key))}"
        aria-label="See funding details for ${escapeHtml(project.title)}">See funding details →</a>
    </article>`;
  }).join("") || '<p class="empty-copy">There are no reviewed project matches to open grants right now.</p>';
}

async function renderResources() {
  const docs = await loadJson("data/source-docs.json");
  document.querySelector("#sourceDocs").innerHTML = docs.map((doc) =>
    card(doc.title, doc.type, doc.summary)
  ).join("");
}

async function renderParticipation() {
  const key = new URLSearchParams(window.location.search).get("project");
  if (!key) return;
  const projects = await loadJson("data/ledger-projects.json");
  const project = projects.find((item) => item.project_key === key);
  if (!project) return;
  const context = document.querySelector("#participationContext");
  context.hidden = false;
  context.querySelector("span").textContent = project.title;
  context.querySelector("a").href = projectHref(key);
}

async function renderEntities() {
  const data = await loadJson("data/entities.json");
  const grid = document.querySelector("#entityGrid");
  const search = document.querySelector("#entitySearch");
  const placeArea = document.querySelector("#placeAreaFilter");
  const category = document.querySelector("#entityCategoryFilter");
  const summary = document.querySelector("#entitySummary");
  const sortButtons = document.querySelectorAll("[data-entity-sort]");
  const state = { category: "All", place: "All", query: "", sort: "default" };
  const townOf = (item) => item.town || item.location || "Island-wide";
  const relationshipState = (item) => /closed|wound up|moved|changed/i.test(item.status || "") ? "Retained correction" : "Research lead — not contacted";
  if (summary) {
    const researchOnly = data.filter((item) => !/closed|wound up|moved|changed/i.test(item.status || "")).length;
    const unknownPlaces = data.filter((item) => (item.place_area || "Unknown") === "Unknown").length;
    summary.innerHTML = `<div><strong>${data.length}</strong><span>discovery records</span></div><div><strong>${researchOnly}</strong><span>research leads only</span></div><div><strong>${unknownPlaces}</strong><span>places still to check</span></div>`;
  }
  const updatePlaceOptions = () => {
    if (!placeArea) return;
    const counts = data.reduce((acc, item) => {
      acc[item.place_area || "Unknown"] = (acc[item.place_area || "Unknown"] || 0) + 1;
      return acc;
    }, {});
    [...placeArea.options].forEach((option) => {
      if (option.value === "All") {
        option.textContent = `All place areas (${data.length})`;
        return;
      }
      const suffix = option.value === "Unknown" ? " / needs check" : "";
      option.textContent = `${option.value}${suffix} (${counts[option.value] || 0})`;
    });
  };
  const compareText = (a, b, selector) => selector(a).localeCompare(selector(b));
  const sortItems = (items) => {
    const sorted = [...items];
    if (state.sort === "az") return sorted.sort((a, b) => compareText(a, b, (item) => item.name));
    if (state.sort === "za") return sorted.sort((a, b) => compareText(b, a, (item) => item.name));
    return sorted.sort((a, b) => compareText(a, b, (item) => item.source_group || item.category) || compareText(a, b, (item) => item.name));
  };
  const draw = () => {
    const query = state.query.trim().toLowerCase();
    const items = data.filter((item) => {
      const filterMatch = state.category === "All" || item.category === state.category || item.source_group === state.category;
      const placeMatch = state.place === "All" || item.place_area === state.place;
      const searchMatch = !query || `${item.name} ${item.category} ${item.location} ${item.town || ""} ${item.place_area || ""} ${item.grant_fit}`.toLowerCase().includes(query);
      return filterMatch && placeMatch && searchMatch;
    });
    grid.innerHTML = sortItems(items).map((item) => card(
      item.name,
      relationshipState(item),
      item.grant_fit,
      `<dl class="card-facts"><div><dt>Possible capability</dt><dd>${escapeHtml(item.category)}</dd></div><div><dt>Place</dt><dd>${escapeHtml(item.place_area || townOf(item))}</dd></div><div><dt>Record type</dt><dd>${escapeHtml(item.record_type || item.source_group || "Public discovery record")}</dd></div></dl>`
    )).join("");
  };
  if (search) search.addEventListener("input", () => {
    state.query = search.value;
    draw();
  });
  if (placeArea) placeArea.addEventListener("change", () => {
    state.place = placeArea.value;
    draw();
  });
  if (category) {
    const categories = unique(data.map((item) => item.source_group || item.category));
    category.innerHTML = `<option value="All">All capabilities (${data.length})</option>${categories.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}`;
    category.addEventListener("change", () => {
      state.category = category.value;
      draw();
    });
  }
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.sort = button.dataset.entitySort || "default";
      sortButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      draw();
    });
  });
  if (!category) {
    renderFilters(document.querySelector("#entityFilters"), unique(data.map((item) => item.source_group || item.category)).slice(0, 8), (filter) => {
      state.category = filter || "All";
      draw();
    });
  }
  updatePlaceOptions();
  draw();
}

async function renderProjects() {
  const [data, projects] = await Promise.all([
    loadJson("data/projects.json"),
    loadJson("data/ledger-projects.json"),
  ]);
  const projectsByKey = new Map(projects.map((item) => [item.project_key, item]));
  const focusedProject = new URLSearchParams(window.location.search).get("project") || "";
  const orderedData = focusedProject
    ? [...data].sort((a, b) => Number(slugify(b.title) === focusedProject) - Number(slugify(a.title) === focusedProject))
    : data;
  const grid = document.querySelector("#projectGrid");
  const draw = (filter = "All") => {
    const items = filter === "All" ? orderedData : orderedData.filter((item) => item.domain === filter);
    grid.innerHTML = items.map((item) => {
      const projectSlug = slugify(item.title);
      const actions = [
        ...(item.ledger_project_keys || []).map((key) => projectsByKey.get(key)).filter(Boolean)
          .map((project) => ({ label: project.title, url: projectHref(project.project_key) })),
        { label: "Earlier project site", url: item.public_page },
        { label: "Earlier repository", url: item.github_repo }
      ];
      const topics = grantFacts(null, [["Earlier funding ideas", item.grant_angles.join(", ")]]);
      return card(item.title, item.domain, item.summary, topics, "", actions, `project-${projectSlug}`, projectSlug === focusedProject ? "is-featured" : "");
    }).join("");
  };
  renderFilters(document.querySelector("#projectFilters"), unique(data.map((item) => item.domain)), draw);
  draw();
}

function emptyState(container, message) {
  container.innerHTML = `<article class="data-card empty-state"><p class="tag">Awaiting research</p><h3>No reviewed records yet</h3><p>${message}</p></article>`;
}

async function renderLedgerProjects() {
  const [projects, matches, grants, archive, earlierProjects] = await Promise.all([
    loadJson("data/ledger-projects.json"),
    loadJson("data/grant-project-matches.json"),
    loadJson("data/grants.json"),
    loadJson("data/grant-archive.json"),
    loadJson("data/projects.json"),
  ]);
  const grid = document.querySelector("#ledgerProjectGrid");
  const search = document.querySelector("#projectSearch");
  const region = document.querySelector("#projectRegion");
  const category = document.querySelector("#projectCategory");
  const coverage = document.querySelector("#ledgerProjectCoverage");
  const involvement = document.querySelector("#projectInvolvement");
  const sort = document.querySelector("#projectSort");
  const regions = { local: "Minjerribah & nearby", australian: "Australian projects", global: "Global connections" };
  const regionOrder = Object.keys(regions);
  const categories = [
    ["Environment & disaster resilience", [
      "aura-disaster-resilience", "straddie-capsule-surge-lab", "wildlife-rescue-minjerribah",
      "straddie-tip-loop-lab", "straddie-clean-energy-superpower", "bees-and-allies",
    ]],
    ["Community, co-ops & local participation", [
      "ready-set-co-op-cultural-intelligence-node", "ready-s-e-t-co-op-trust-hub", "straddie-shared-table",
      "plfc-community-platform", "plfc-ai-agent-md-forms", "moreton-bay-community-wealth-and-mutuals",
      "7-mile-planning-and-administration", "grey-area-commons",
    ]],
    ["Arts, screen, music & events", [
      "ballow-road-sand-screen-hub", "quandamooka-country-events-engine", "minjerribah-screen-media-network",
      "quandamooka-film-festival", "film-club-documentary-builders", "straddie-content-assets-kit",
      "grain-by-grain-documentary", "i-c-infinity-music-universe", "two-dogs-podcast-planning",
      "explorer-music-video-lab", "sovereign-music-australia",
    ]],
    ["Sport, health & wellbeing", [
      "community-club-builder-sandy-sports", "82-claytons-road-a-gift-for-generations",
      "amity-outdoor-fitness-and-safer-access", "health-and-culture", "rough-as-guts",
      "oceania-healthy-de-slop-co-ops",
    ]],
    ["Island maps & digital twins", [
      "straddie-twins", "straddie-digital-twin-explainer", "straddie-digital-twin-builders",
      "straddie-twin-prototype", "straddie-noticeboard-network",
    ]],
    ["Infrastructure, access & local enterprise", [
      "minjerribah-site-and-service-ideas", "grain-by-grain", "straddie-maker-space-lab", "dunwich-gumpi-ferry-terminal-lab",
      "bigger-local-picture", "sandworm-subterranean-systems", "straddie-night-market-lab",
      "moreton-bay-autonomous-mobility",
    ]],
    ["Civic tools, law & funding", [
      "straddie-tenders-lab", "legal-memory-workbench",
      "australian-legal-engine", "p4a-purple-party-for-australia",
    ]],
    ["Longer timelines & research", [
      "gajra-earth-infinity", "gajra-earth-public-hub", "gajra-earth-claude-build",
      "civilisation-of-sand", "cosmic-nexus", "mineral-moonshots",
    ]],
  ];
  const projectsByKey = new Map(projects.map((item) => [item.project_key, item]));
  const relatedKeys = [
    ["ready-set-co-op-cultural-intelligence-node", "ready-s-e-t-co-op-trust-hub"],
    ["gajra-earth-infinity", "gajra-earth-public-hub", "gajra-earth-claude-build"],
    ["minjerribah-site-and-service-ideas", "7-mile-planning-and-administration", "82-claytons-road-a-gift-for-generations",
      "straddie-maker-space-lab", "straddie-tip-loop-lab", "straddie-clean-energy-superpower"],
    ["straddie-twins", "straddie-digital-twin-explainer", "straddie-digital-twin-builders", "straddie-twin-prototype"],
  ];
  const relatedByKey = new Map(relatedKeys.flatMap((keys) => keys.map((key) => [key,
    keys.filter((related) => related !== key).map((related) => projectsByKey.get(related)).filter(Boolean),
  ])));
  const earlierByKey = new Map();
  earlierProjects.forEach((item) => {
    (item.ledger_project_keys || []).forEach((key) => {
      if (!earlierByKey.has(key)) earlierByKey.set(key, []);
      earlierByKey.get(key).push(item);
    });
  });
  const categoryByKey = new Map(categories.flatMap(([label, keys]) => keys.map((key) => [key, label])));
  const categoryRank = new Map(categories.flatMap(([, keys]) => keys).map((key, index) => [key, index]));
  const categoryOf = (item) => categoryByKey.get(item.project_key) || "Other projects";
  const byRegion = (a, b) => regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region);
  const categoryLabels = [...categories.map(([label]) => label), "Other projects"];
  const byCategoryOrder = (a, b) => byRegion(a, b) ||
    (categoryRank.get(a.project_key) ?? Infinity) - (categoryRank.get(b.project_key) ?? Infinity);
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const archivedKeys = new Set([
    ...archive.flatMap((item) => item.project_keys),
    ...matches.filter((match) => {
      const grant = grantByKey.get(match.grant_source_key);
      return grant?.opportunity_type === "grant" && isClosedRound(grant);
    }).map((match) => match.project_key),
  ]);
  const layers = new Map();
  activeMatches(matches, projectsByKey, grantByKey).forEach((match) => {
    if (!layers.has(match.project_key)) layers.set(match.project_key, []);
    layers.get(match.project_key).push(grantByKey.get(match.grant_source_key));
  });
  const projectCategories = new Set(projects.map(categoryOf));
  categoryLabels.filter((label) => projectCategories.has(label))
    .forEach((label) => category.add(new Option(label, label)));
  const fundingFor = (item) => layers.get(item.project_key) || [];
  const count = document.querySelector("#projectCatalogueSummary");
  count.innerHTML = `<div><strong>${projects.length}</strong><span>projects</span></div><div><strong>${projects.filter((item) => fundingFor(item).some(isOpenGrant)).length}</strong><span>with an open grant match</span></div>`;
  const nearestDeadline = (item) => Math.min(...fundingFor(item)
    .filter((grant) => grant.opportunity_type === "grant" && grant.deadline_date)
    .map(deadlineTime));
  const renderCard = (item) => {
    const key = item.project_key;
    const options = fundingFor(item);
    const open = options.filter(isOpenGrant).length;
    const involvementLabel = item.involvement === "others_involved" ? "Other people involved" : "Open invitation";
    const other = options.length - open;
    const fundingLabel = [
      open ? `${open} open grant match${open === 1 ? "" : "es"}` : "",
      other ? `${other} other option${other === 1 ? "" : "s"} to check` : "",
    ].filter(Boolean).join(" · ");
    const details = grantFacts(null, [
      ["People", involvementLabel],
      ["Funding", fundingLabel || "No funding match reviewed yet"],
    ]);
    const tag = key === "straddie-twins" ? "Start here · Digital twins explainer"
      : key === "mineral-moonshots" ? "Earlier long-timeline research" : item.lane;
    const related = relatedByKey.get(key) || [];
    const earlier = earlierByKey.get(key) || [];
    const parts = related.length ? `<details class="archive-projects">
      <summary>${related.length} related project${related.length === 1 ? "" : "s"}</summary>
      <ul class="resource-links">${related.map((project) => `<li><a href="${escapeHtml(projectHref(project.project_key))}">${escapeHtml(project.title)}</a></li>`).join("")}</ul>
    </details>` : "";
    const provenance = earlier.length ? `<details class="archive-projects">
      <summary>Earlier research</summary>
      <ul class="resource-links">${earlier.map((project) => `<li><a href="projects.html#project-${escapeHtml(slugify(project.title))}">${escapeHtml(project.title)}</a></li>`).join("")}</ul>
    </details>` : "";
    return card(item.title, tag, item.summary, details, "", [
      { label: "Project site", url: item.public_url },
      { label: options.length ? "Funding options" : "Funding research", url: stackHref(key) },
      archivedKeys.has(key) ? { label: "Past grant rounds", url: `grant-archive.html?project=${encodeURIComponent(key)}` } : null,
      { label: "Take part", url: `participate.html?project=${encodeURIComponent(key)}` },
    ], `ledger-${key}`).replace("</article>", `${parts}${provenance}</article>`);
  };
  const draw = () => {
    const query = search.value.trim().toLowerCase();
    const items = projects.filter((item) => {
      const options = fundingFor(item);
      const open = options.filter(isOpenGrant).length;
      const coverageMatches = coverage.value === "All" ||
        coverage.value === "Open" && open > 0 ||
        coverage.value === "Other" && options.length > open ||
        coverage.value === "None" && !options.length;
      const searchText = [item.title, item.lane, item.summary, regions[item.region], categoryOf(item), ...(item.grant_angles || [])].join(" ").toLowerCase();
      return (!query || searchText.includes(query)) &&
        (!region.value || item.region === region.value) &&
        (!category.value || categoryOf(item) === category.value) &&
        (!involvement.value || item.involvement === involvement.value) &&
        coverageMatches;
    });
    const byName = (a, b) => a.title.localeCompare(b.title);
    document.querySelector("#projectResults").textContent = `${items.length} project${items.length === 1 ? "" : "s"} found`;
    if (!items.length) {
      grid.innerHTML = '<p class="empty-copy">No projects match. Try another search or clear a filter.</p>';
      return;
    }
    if (sort.value === "name" || sort.value === "deadline") {
      items.sort((a, b) => (sort.value === "deadline" ? nearestDeadline(a) - nearestDeadline(b) : 0) || byName(a, b));
      grid.innerHTML = `<div class="data-grid">${items.map(renderCard).join("")}</div>`;
      return;
    }
    const groups = (sort.value === "category"
      ? categoryLabels.map((label) => ({
        label, items: items.filter((item) => categoryOf(item) === label).sort(byCategoryOrder),
      }))
      : regionOrder.map((key) => ({
        label: regions[key], items: items.filter((item) => item.region === key).sort(byName),
      }))).filter((group) => group.items.length);
    const photo = document.querySelector("#projectPhoto").innerHTML;
    grid.innerHTML = groups.map((group, index) => `
      ${index === 1 ? photo : ""}
      <section class="project-region-group" aria-label="${escapeHtml(group.label)}">
        <h3>${escapeHtml(group.label)}</h3>
        <div class="data-grid">${group.items.map(renderCard).join("")}</div>
      </section>`).join("");
  };
  search.addEventListener("input", draw);
  [region, category, coverage, involvement, sort].forEach((control) => control.addEventListener("change", draw));
  draw();
  const showLinkedProject = () => {
    const hash = window.location.hash;
    if (!hash.startsWith("#ledger-")) return;
    if (hash === "#ledger-stradbroke-grants-lab" && !projectsByKey.has("stradbroke-grants-lab")) {
      window.location.replace("resources.html#grants-lab");
      return;
    }
    if (projectsByKey.has(hash.slice("#ledger-".length)) && !document.getElementById(hash.slice(1))) {
      search.value = region.value = category.value = involvement.value = "";
      coverage.value = "All";
      draw();
    }
  };
  window.addEventListener("hashchange", showLinkedProject);
  showLinkedProject();
}

async function renderGrantActionQueue() {
  const [matches, projects, grants, pathways, archive] = await Promise.all([
    loadJson("data/grant-project-matches.json"),
    loadJson("data/ledger-projects.json"),
    loadJson("data/grants.json"),
    loadJson("data/partner-pathways.json"),
    loadJson("data/grant-archive.json"),
  ]);
  const projectByKey = new Map(projects.map((item) => [item.project_key, item]));
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const matchByKey = new Map(matches.map((item) => [item.match_key, item]));
  const pathwayKeys = new Set(pathways.map((item) => item.pathway_key));
  const projectsWithHistory = new Set(archive.flatMap((item) => item.project_keys));
  matches.forEach((match) => {
    const grant = grantByKey.get(match.grant_source_key);
    if (grant?.opportunity_type === "grant" && isClosedRound(grant)) projectsWithHistory.add(match.project_key);
  });
  const grid = document.querySelector("#grantMatchGrid");
  const summary = document.querySelector("#grantMatchSummary");
  const filters = document.querySelector("#grantMatchFilters");
  const overview = document.querySelector("#grantQueueIntro");

  const fundingGroups = {
    open: "Open grants",
    future: "Future rounds",
    support: "Other possible support",
  };
  const fundingGroup = (item) => {
    const grant = grantByKey.get(item.grant_source_key);
    if (grant.opportunity_type !== "grant") return "support";
    return ["open", "rolling"].includes(grant.availability) ? "open" : "future";
  };
  const groupRank = { open: 0, future: 2, support: 3 };
  const fundingRank = (item) => groupRank[fundingGroup(item)] +
    Number(fundingGroup(item) === "open" && item.fit_status === "watch");
  const priorityWeight = { act_now: 0, prepare_next: 1, build_pathway: 2, watch: 3 };
  const sortMatches = (items) => [...items].sort((a, b) => {
    const groupDifference = fundingRank(a) - fundingRank(b);
    if (groupDifference) return groupDifference;
    const priorityDifference = (priorityWeight[a.action_priority] ?? 9) - (priorityWeight[b.action_priority] ?? 9);
    if (priorityDifference) return priorityDifference;
    const dateA = a.action_by || "9999-12-31";
    const dateB = b.action_by || "9999-12-31";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (projectByKey.get(a.project_key)?.title || a.project_key).localeCompare(projectByKey.get(b.project_key)?.title || b.project_key);
  });
  const ordered = sortMatches(activeMatches(matches, projectByKey, grantByKey));
  const matchesByProject = new Map();
  ordered.forEach((item) => {
    if (!matchesByProject.has(item.project_key)) matchesByProject.set(item.project_key, []);
    matchesByProject.get(item.project_key).push(item);
  });
  const primary = [...matchesByProject.values()].map((items) => items[0]);
  const openProjectCount = primary.filter((item) => fundingGroup(item) === "open").length;

  if (summary) {
    summary.innerHTML = `
      <div><strong>${openProjectCount}</strong><span>projects with an open grant to check</span></div>
      <div><strong>${matchesByProject.size}/${projects.length}</strong><span>projects with recorded funding options</span></div>
      <div><strong>${ordered.length}</strong><span>grant and support options reviewed</span></div>`;
  }

  const renderLayer = (item, label, expanded = false) => {
    const grant = grantByKey.get(item.grant_source_key);
    return `<details class="stack-detail" id="match-${escapeHtml(item.match_key)}"${expanded ? " open" : ""}>
      <summary>${escapeHtml(label)}</summary>
      <dl class="card-facts">
        <div><dt>Funding type</dt><dd>${escapeHtml(item.stack_role || opportunityTypeLabel(grant.opportunity_type))}</dd></div>
        <div><dt>Official funding</dt><dd>${escapeHtml(grant.funding || "Check source")}</dd></div>
        <div><dt>Amount to consider</dt><dd>${escapeHtml(item.funding_ask || "To be worked out")}</dd></div>
        <div><dt>Deadline</dt><dd>${escapeHtml(grant.deadline || "No fixed date")}</dd></div>
        <div><dt>What this could fund</dt><dd>${escapeHtml(item.qualifying_reframe)}</dd></div>
        <div><dt>Why it could fit</dt><dd>${escapeHtml(item.fit_reason)}</dd></div>
        <div><dt>Check before applying</dt><dd>${escapeHtml(item.eligibility_status)}</dd></div>
        <div><dt>What to do next</dt><dd>${escapeHtml(item.next_move)}</dd></div>
        <div><dt>What needs to be ready</dt><dd>${escapeHtml(item.readiness_check)}</dd></div>
        <div><dt>Other funding to look for</dt><dd>${escapeHtml(item.cofunding_plan)}</dd></div>
        <div><dt>Who could help</dt><dd>${escapeHtml(sentenceList(item.human_roles))}</dd></div>
        <div><dt>Research and drafting</dt><dd>${escapeHtml(sentenceList(item.ai_tasks))}</dd></div>
        <div><dt>Evidence needed</dt><dd>${escapeHtml(sentenceList(item.evidence_needed))}</dd></div>
        <div><dt>Reviewed</dt><dd>${escapeHtml(item.last_checked)}</dd></div>
      </dl>
      <div class="card-actions">
        <a href="${escapeHtml(grantHref(grant.source_key))}">Funding desk details</a>
        <a href="${escapeHtml(grant.url)}" target="_blank" rel="noopener noreferrer">Official source</a>
        ${pathwayKeys.has(`${item.match_key}--roles`) ? `<a href="partner-pathways.html#roles-${escapeHtml(item.match_key)}">Roles for this option</a>` : ""}
      </div>
    </details>`;
  };

  const projectActions = (project, focused) => `
    <div class="card-actions">
      <a href="${escapeHtml(projectHref(project.project_key))}">Project record</a>
      ${project.public_url ? `<a href="${escapeHtml(project.public_url)}" target="_blank" rel="noopener noreferrer">Project site</a>` : ""}
      ${focused && projectsWithHistory.has(project.project_key) ? `<a href="grant-archive.html?project=${encodeURIComponent(project.project_key)}">Past grant rounds for this project</a>` : ""}
      ${focused ? '<a href="profile-kit.html">Prepare the evidence</a>' : ""}
    </div>`;

  const browseStacks = '<a class="text-link" href="grant-matches.html">Browse funding by project</a>';

  const availabilityTag = (item) => {
    const grant = grantByKey.get(item.grant_source_key);
    if (fundingGroup(item) === "support") return fundingGroups.support;
    return ({ open: "Open grant", rolling: "Open for rolling applications", opening_soon: "Opening soon" })[grant.availability] || "Future round";
  };

  const renderProjectStack = (item, focused = false, selectedMatchKey = "", notice = "") => {
    const project = projectByKey.get(item.project_key);
    const grant = grantByKey.get(item.grant_source_key);
    const layers = matchesByProject.get(item.project_key);
    const selected = selectedMatchKey === item.match_key;
    return `<article class="funding-stack-card" id="project-${escapeHtml(item.project_key)}">
      <header>
        ${focused ? browseStacks : ""}
        <p class="tag">${focused ? "Project funding" : escapeHtml(availabilityTag(item))}</p>
        ${focused ? `<h1>${escapeHtml(project.title)}</h1>` : `<h2><a href="${escapeHtml(stackHref(project.project_key))}">${escapeHtml(project.title)}</a></h2>`}
        <p>${escapeHtml(project.summary)}</p>
      </header>
      ${notice ? `<div class="stack-next"><p>${escapeHtml(notice)}</p></div>` : ""}
      <section class="primary-funding">
        <div class="primary-funding-title"><span>${escapeHtml(availabilityTag(item))}</span><h3><a href="${escapeHtml(grantHref(grant.source_key))}">${escapeHtml(grant.name)}</a></h3></div>
        <strong class="funding-amount">${escapeHtml(item.funding_ask || grant.funding || "Amount to verify")}</strong>
        <dl class="compact-facts">
          <div><dt>Funding available</dt><dd>${escapeHtml(grant.funding || "Check source")}</dd></div>
          <div><dt>Deadline</dt><dd>${escapeHtml(grant.deadline || "No fixed date")}</dd></div>
          <div><dt>Who can apply</dt><dd>${escapeHtml(grant.applicants || item.eligibility_status)}</dd></div>
        </dl>
      </section>
      <div class="stack-next"><span>What to do next${item.action_by ? ` · by ${escapeHtml(formatActionDate(item.action_by))}` : ""}</span><p>${escapeHtml(item.next_move)}</p></div>
      ${focused ? `
        <div class="stack-next"><span>Check before applying</span><p>${escapeHtml(item.eligibility_status)}</p></div>
        <div class="stack-next"><span>Who could help</span><p>${escapeHtml(sentenceList(item.human_roles))}</p></div>
        ${renderLayer(item, "Funding details and evidence", selected)}
        ${Object.entries(fundingGroups).map(([key, label]) => {
          const options = layers.filter((layer) => layer !== item && fundingGroup(layer) === key);
          if (!options.length) return "";
          return `<section aria-label="${label}"><div class="stack-next"><h2>${key === "open" && fundingGroup(item) === "open" ? "Other open grants" : label}</h2></div>${options.map((layer) => renderLayer(layer, grantByKey.get(layer.grant_source_key).name)).join("")}</section>`;
        }).join("")}
      ` : ""}
      ${projectActions(project, focused)}
    </article>`;
  };

  let filter = "All";
  const drawRoute = () => {
    const hash = window.location.hash.slice(1);
    const isProject = hash.startsWith("project-");
    const isMatch = hash.startsWith("match-");
    const wasFocused = overview.hidden;
    overview.hidden = isProject || isMatch;
    if (!overview.hidden) {
      document.title = "Funding by project | Stradbroke Grants Lab";
      const items = filter === "All" ? primary : sortMatches([...matchesByProject.values()]
        .map((items) => items.find((item) => fundingGroup(item) === filter)).filter(Boolean));
      grid.innerHTML = items.map((item) => renderProjectStack(item)).join("") ||
        '<p class="empty-copy">No funding matches in this view. Browse the <a href="ledger-projects.html">project finder</a> or the <a href="grant-archive.html">grant archive</a>.</p>';
      if (wasFocused) window.scrollTo(0, 0);
      return;
    }

    const requestedMatchKey = isMatch ? hash.slice("match-".length) : "";
    const projectKey = isProject ? hash.slice("project-".length)
      : matchByKey.get(requestedMatchKey)?.project_key || requestedMatchKey.split("--").pop();
    const project = projectByKey.get(projectKey);
    if (!project) {
      document.title = "Funding record unavailable | Stradbroke Grants Lab";
      grid.innerHTML = `<section class="data-card" id="${escapeHtml(hash)}">
        <h1>Funding record unavailable</h1>
        <p>This link does not point to a current project record.</p>
        <div class="card-actions">${browseStacks}<a href="ledger-projects.html">Find a project</a><a href="grant-archive.html">Search past grant rounds</a></div>
      </section>`;
      return;
    }

    document.title = `${project.title} funding | Stradbroke Grants Lab`;
    const layers = matchesByProject.get(projectKey) || [];
    const selected = layers.find((layer) => layer.match_key === requestedMatchKey);
    const notice = isMatch && !selected ? "This option is no longer listed for this project." : "";
    if (layers.length) {
      grid.innerHTML = renderProjectStack(selected || layers[0], true, requestedMatchKey, notice);
    } else {
      grid.innerHTML = `<article class="funding-stack-card" id="project-${escapeHtml(projectKey)}">
        <header>
          ${browseStacks}
          <p class="tag">Project funding</p>
          <h1>${escapeHtml(project.title)}</h1>
          <p>${escapeHtml(project.summary)}</p>
        </header>
        <div class="stack-next"><h2>No current funding match</h2>${notice ? `<p>${escapeHtml(notice)}</p>` : ""}<p>Choose one piece of work to fund and check who could apply before shortlisting grants.</p></div>
        ${projectActions(project, true)}
      </article>`;
    }
    if (isMatch && !selected) document.getElementById(`project-${projectKey}`)?.scrollIntoView();
  };

  if (filters) {
    const available = Object.keys(fundingGroups).filter((key) => ordered.some((item) => fundingGroup(item) === key));
    filters.innerHTML = ["All", ...available].map((key, index) => {
      const label = key === "All" ? "All projects" : fundingGroups[key];
      return `<button type="button" class="${index === 0 ? "is-active" : ""}" data-filter="${key}">${label}</button>`;
    }).join("");
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
      filter = button.dataset.filter;
      drawRoute();
    });
  }
  document.querySelector(".skip-link")?.addEventListener("click", (event) => {
    if (!overview.hidden) return;
    event.preventDefault();
    document.getElementById("main").focus();
  });
  window.addEventListener("hashchange", drawRoute);
  drawRoute();
}

async function renderPartnerPathways() {
  const [pathways, projects, grants, matches, entities] = await Promise.all([
    loadJson("data/partner-pathways.json"),
    loadJson("data/ledger-projects.json"),
    loadJson("data/grants.json"),
    loadJson("data/grant-project-matches.json"),
    loadJson("data/entities.json")
  ]);
  const projectByKey = new Map(projects.map((item) => [item.project_key, item]));
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const matchByPair = new Map(activeMatches(matches, projectByKey, grantByKey)
    .map((item) => [`${item.project_key}::${item.grant_source_key}`, item]));
  const grid = document.querySelector("#partnerPathwayGrid");
  if (!pathways.length) {
    emptyState(grid, "The weekly scan will add role-based planning here. Named organisations remain uncontacted research leads until Luke reviews them.");
    return;
  }
  const draw = (filter = "All") => {
    const items = filter === "All" ? pathways : pathways.filter((item) => item.planning_status === filter);
    grid.innerHTML = items.map((item) => {
      const project = projectByKey.get(item.project_key);
      const grant = grantByKey.get(item.grant_source_key);
      const match = matchByPair.get(`${item.project_key}::${item.grant_source_key}`);
      const closed = grant && isClosedRound(grant);
      const candidates = item.candidate_partners.length
        ? item.candidate_partners.map((candidate) => `${candidate.name} — ${candidate.proposed_role} — ${candidate.assent_status}`).join("; ")
        : `No person or organisation assigned. Review the ${entities.length} public discovery records by capability.`;
      return card(
        project?.title || item.project_key,
        item.planning_status === "research_only" ? "Research-only role map" : item.planning_status.replaceAll("_", " "),
        item.boundary_note,
        grantFacts(grant, [
          grant ? ["Program", grant.name] : null,
          ["Roles to fill", item.roles_needed.join("; ")],
          ["Possible candidates", candidates],
          ["Next project move", match?.next_move || "Confirm the required role before reviewing names."],
          ["Checked", item.last_checked]
        ].filter(Boolean)),
        "",
        [
          project ? { label: "Project record", url: projectHref(project.project_key) } : null,
          match ? { label: "Reviewed funding fit", url: stackHref(project.project_key, match.match_key) } : null,
          grant ? {
            label: closed ? "Archived grant record" : "Funding desk record",
            url: closed ? `grant-archive.html#grant-${grant.source_key}` : grantHref(grant.source_key),
          } : null,
          { label: "Browse potential connections", url: "entities.html" }
        ],
        `roles-${item.pathway_key.replace(/--roles$/, "")}`
      );
    }).join("");
  };
  const statuses = unique(pathways.map((item) => item.planning_status));
  if (statuses.length > 1) renderFilters(document.querySelector("#partnerPathwayFilters"), statuses, draw);
  else if (document.querySelector("#partnerPathwayFilters")) document.querySelector("#partnerPathwayFilters").hidden = true;
  draw();
}

async function renderGrants() {
  const data = await loadJson("data/grants.json");
  const level = document.body.dataset.level;
  const items = data.filter((item) => item.level === level && !isClosedRound(item));
  const grid = document.querySelector("#grantGrid");
  grid.innerHTML = items.map((item) => card(item.name, item.status, item.best_for, grantFacts(item, [["Checked", item.last_checked]]), "", [
    { label: "Funding desk record", url: grantHref(item.source_key) },
    { label: "Official source", url: item.url },
  ])).join("") ||
    '<p class="empty-copy">No current sources in this category. Browse the <a href="grant-archive.html">grant archive</a>.</p>';
}

async function renderWindows() {
  const [data, grants] = await Promise.all([
    loadJson("data/grant-windows.json"),
    loadJson("data/grants.json")
  ]);
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const grid = document.querySelector("#windowGrid");
  const visible = data.filter((item) => {
    const grant = grantByKey.get(item.source_key);
    return grant && !isClosedRound(grant);
  });
  const draw = (filter = "All") => {
    const items = filter === "All" ? visible : visible.filter((item) => item.window_type === filter);
    grid.innerHTML = items.map((item) => card(item.title, item.window_type, item.tip,
      grantFacts(grantByKey.get(item.source_key), [["Who should care", item.notify], ["Action", item.action]]), "", [
        { label: "Funding desk record", url: grantHref(item.source_key) },
      ])).join("");
  };
  renderFilters(document.querySelector("#windowFilters"), unique(visible.map((item) => item.window_type)), draw);
  draw();
}

async function renderWatchlist() {
  const [data, matches, projects, grants] = await Promise.all([
    loadJson("data/grant-watchlist.json"),
    loadJson("data/grant-project-matches.json"),
    loadJson("data/ledger-projects.json"),
    loadJson("data/grants.json"),
  ]);
  const modeOf = (item) => {
    if (isClosedRound(item)) return null;
    if (["support_information", "partner_watch", "finance", "fundraising", "tender"].includes(item.opportunity_type)) return "past";
    if (item.opportunity_type !== "grant") return "sources";
    return ["open", "rolling"].includes(item.availability) ? "open" : "prepare";
  };
  const projectByKey = new Map(projects.map((item) => [item.project_key, item]));
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const watchByKey = new Map(data.map((item) => [item.source_key, item]));
  const matchesByGrant = new Map();
  activeMatches(matches, projectByKey, grantByKey).forEach((match) => {
    if (!matchesByGrant.has(match.grant_source_key)) matchesByGrant.set(match.grant_source_key, []);
    matchesByGrant.get(match.grant_source_key).push(match);
  });
  const relatedProjects = (item) => {
    const related = matchesByGrant.get(item.source_key) || [];
    if (!related.length) {
      return item.opportunity_type === "grant" ? '<p class="empty-copy">No reviewed project match is recorded for this opportunity.</p>' : "";
    }
    related.sort((a, b) => projectByKey.get(a.project_key).title.localeCompare(projectByKey.get(b.project_key).title));
    return `<details class="archive-projects">
      <summary>${related.length} reviewed project ${related.length === 1 ? "pathway" : "pathways"}</summary>
      <ul class="resource-links">${related.map((match) => {
        const project = projectByKey.get(match.project_key);
        return `<li><a href="${escapeHtml(stackHref(project.project_key, match.match_key))}">${escapeHtml(project.title)} funding fit</a> · <a href="${escapeHtml(projectHref(project.project_key))}">Project record</a></li>`;
      }).join("")}</ul>
    </details>`;
  };
  const sorted = [...data].sort((a, b) => deadlineTime(a) - deadlineTime(b) || a.title.localeCompare(b.title));
  const panels = document.querySelectorAll("[data-funding-panel]");
  panels.forEach((panel) => {
    const items = sorted.filter((item) => modeOf(item) === panel.dataset.fundingPanel);
    panel.querySelector(".data-grid").innerHTML = items.map((item) => card(
      item.title,
      availabilityLabel(item.availability),
      item.summary,
      grantFacts(item, [["Level", item.level_label], ["What to do", item.action], ["Status", item.status], ["Checked", item.last_checked]]),
      "",
      [{ label: "Official source", url: item.source_url }],
      `grant-${item.source_key}`
    ).replace("</article>", `${relatedProjects(item)}</article>`)).join("") || '<p class="empty-copy">No opportunities in this view. Try another category or the source library.</p>';
  });
  const tabs = document.querySelector("#fundingViewTabs");
  const showPanel = (key) => {
    panels.forEach((panel) => { panel.hidden = panel.dataset.fundingPanel !== key; });
    tabs.querySelectorAll("[data-funding-view]").forEach((button) => {
      const active = button.dataset.fundingView === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };
  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-funding-view]");
    if (button) showPanel(button.dataset.fundingView);
  });
  const showLinkedGrant = async () => {
    const hash = window.location.hash;
    if (!hash.startsWith("#grant-")) return;
    const key = hash.slice("#grant-".length);
    const item = watchByKey.get(key);
    if (item && modeOf(item)) {
      showPanel(modeOf(item));
      return;
    }
    const archive = await loadJson("data/grant-archive.json");
    if (window.location.hash !== hash) return;
    if (archive.some((round) => round.source_key === key) || grantByKey.has(key) && isClosedRound(grantByKey.get(key))) {
      window.location.replace(`grant-archive.html${hash}`);
    }
  };
  showPanel("open");
  window.addEventListener("hashchange", showLinkedGrant);
  await showLinkedGrant();
}

async function renderArchive() {
  const [archived, current, projects, matches] = await Promise.all([
    loadJson("data/grant-archive.json"),
    loadJson("data/grants.json"),
    loadJson("data/ledger-projects.json"),
    loadJson("data/grant-project-matches.json"),
  ]);
  const stored = new Set(archived.map((item) => `${item.source_key}:${item.deadline_date}`));
  const newlyClosed = current.filter((item) => item.opportunity_type === "grant" && isClosedRound(item) && !stored.has(`${item.source_key}:${item.deadline_date}`));
  const data = [...archived, ...newlyClosed.map((item) => ({
    ...item,
    project_keys: matches.filter((match) => match.grant_source_key === item.source_key).map((match) => match.project_key),
  }))].sort((a, b) => (b.deadline_date || "").localeCompare(a.deadline_date || "") || a.name.localeCompare(b.name));
  const projectByKey = new Map(projects.map((project) => [project.project_key, project]));
  const project = projectByKey.get(new URLSearchParams(window.location.search).get("project"));
  const context = document.querySelector("#archiveProjectContext");
  if (project) {
    context.hidden = false;
    context.querySelector("strong").textContent = project.title;
    context.querySelector("[data-project-record]").href = projectHref(project.project_key);
  }
  const latestByGrant = new Map();
  data.forEach((item) => {
    if (!latestByGrant.has(item.source_key)) latestByGrant.set(item.source_key, item);
  });
  const search = document.querySelector("#archiveSearch");
  const year = document.querySelector("#archiveYear");
  unique(data.map((item) => item.deadline_date?.slice(0, 4)).filter(Boolean)).forEach((value) => year.add(new Option(value, value)));
  const draw = () => {
    const query = search.value.trim().toLowerCase();
    const items = data.filter((item) => {
      const names = item.project_keys.map((key) => projectByKey.get(key)?.title).join(" ");
      return (!project || item.project_keys.includes(project.project_key)) &&
        (!year.value || item.deadline_date?.startsWith(year.value)) &&
        `${item.name} ${item.level_label} ${item.best_for} ${names}`.toLowerCase().includes(query);
    });
    document.querySelector("#archiveResults").textContent = `${items.length} closed round${items.length === 1 ? "" : "s"}`;
    document.querySelector("#archiveGrid").innerHTML = items.map((item) => {
      const related = item.project_keys.map((key) => projectByKey.get(key)).filter(Boolean);
      const relatedLinks = related.length ? `<details class="archive-projects"><summary>${related.length} project${related.length === 1 ? "" : "s"} in past research</summary><ul class="resource-links">${related.map((project) => `<li><a href="${escapeHtml(projectHref(project.project_key))}">${escapeHtml(project.title)}</a></li>`).join("")}</ul></details>` : "";
      const snapshot = item.snapshot ? [{ label: "Historical record", url: `data/history/${encodeURIComponent(item.snapshot)}` }] : [];
      const future = current.find((grant) => grant.source_key === item.source_key && !isClosedRound(grant));
      const details = { ...item, deadline: item.deadline_date ? formatActionDate(item.deadline_date) : "Date not recorded" };
      return card(item.name, "Closed round", item.best_for, grantFacts(details), "", [
        ...snapshot,
        future ? { label: "Current funding desk record", url: grantHref(future.source_key) } : null,
        { label: "Official program source", url: item.url },
      ], latestByGrant.get(item.source_key) === item ? `grant-${item.source_key}` : "").replace("</article>", `${relatedLinks}</article>`);
    }).join("") || '<p class="empty-copy">No archived rounds match. Try another grant, project or year.</p>';
  };
  search.addEventListener("input", draw);
  year.addEventListener("change", draw);
  draw();
}

async function boot() {
  try {
    const page = document.body.dataset.page;
    if (page === "home") await renderHome();
    if (page === "archive") await renderArchive();
    if (page === "resources") await renderResources();
    if (page === "participate") await renderParticipation();
    if (page === "entities") await renderEntities();
    if (page === "projects") await renderProjects();
    if (page === "ledger-projects") await renderLedgerProjects();
    if (page === "grant-matches") await renderGrantActionQueue();
    if (page === "partner-pathways") await renderPartnerPathways();
    if (page === "grants") await renderGrants();
    if (page === "windows") await renderWindows();
    if (page === "watchlist") await renderWatchlist();
    if (page === "profile") renderProfileKit();
    revealLinkedRecord();
    window.addEventListener("hashchange", revealLinkedRecord);
  } catch (error) {
    const main = document.querySelector("main");
    if (main) main.insertAdjacentHTML("beforeend", `<p class="load-error">${escapeHtml(error.message)}. If you opened the file directly, run a local server first.</p>`);
  }
}

boot();
