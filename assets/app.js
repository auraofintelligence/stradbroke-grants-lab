const navHtml = `
  <nav class="nav" aria-label="Main navigation">
    <a class="brand-mark" href="index.html"><span>Stradbroke</span><span>Grants Lab</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
    <div class="nav-links" id="nav-links">
      <a href="ledger-projects.html">Projects</a>
      <a href="grant-matches.html">Funding stacks</a>
      <a href="grant-watchlist.html">Find grants</a>
      <a href="entities.html">Potential connections</a>
      <a href="profile-kit.html">Get ready</a>
    </div>
  </nav>`;

const footerHtml = `
  <p>Stradbroke Grants Lab: project planning, funding stacks, source checks, readiness and reporting.</p>
  <p><a href="workflow.html">How the lab works</a> | <a href="grant-windows.html">Deadline details</a> | <a href="partner-pathways.html">Connection roles</a> | <a href="https://auraofintelligence.github.io/straddie-tenders-lab/">Straddie Tenders Lab</a> | <a href="https://auraofintelligence.github.io/strange-but-true/">Community Ledger</a></p>`;

document.querySelectorAll(".site-header").forEach((header) => {
  if (!header.children.length) header.innerHTML = navHtml;
});
document.querySelectorAll(".site-footer").forEach((footer) => {
  if (!footer.children.length) footer.innerHTML = footerHtml;
});

const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#nav-links");
if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const currentFile = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.getAttribute("href") === currentFile) {
    link.setAttribute("aria-current", "page");
    link.closest(".nav-group")?.classList.add("has-current-page");
  }
});

const topButton = document.querySelector("[data-to-top]");
if (topButton) {
  const updateTopButton = () => topButton.classList.toggle("is-visible", window.scrollY > 560);
  updateTopButton();
  window.addEventListener("scroll", updateTopButton, { passive: true });
  topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

async function loadJson(path) {
  const response = await fetch(path);
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
  if (item?.deadline_date) return Date.parse(`${item.deadline_date}T23:59:59+10:00`);
  const value = typeof item === "string" ? item : item?.deadline;
  const months = { january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 };
  const dates = [...String(value || "").matchAll(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi)];
  if (!dates.length) return Number.POSITIVE_INFINITY;
  const last = dates.at(-1);
  return Date.UTC(Number(last[3]), months[last[2].toLowerCase()], Number(last[1]));
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
  const anchor = id ? ` id="${id}"` : "";
  const classes = className ? ` ${className}` : "";
  return `<article class="data-card${classes}"${anchor}><p class="tag">${escapeHtml(tag || "Item")}</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>${meta ? `<div class="meta">${meta}</div>` : ""}${actionLinks}</article>`;
}

function grantFacts(grant, extraFacts = []) {
  const facts = grant ? [
    ["Funding", grant.funding],
    ["Deadline", grant.deadline],
    ["Applicants", grant.applicants],
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
  const [grants, projects, ledgerProjects, entities, docs, matches] = await Promise.all([
    loadJson("data/grants.json"),
    loadJson("data/projects.json"),
    loadJson("data/ledger-projects.json"),
    loadJson("data/entities.json"),
    loadJson("data/source-docs.json"),
    loadJson("data/grant-project-matches.json"),
  ]);
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const projectByKey = new Map(ledgerProjects.map((item) => [item.project_key, item]));
  const projectKeysWithPaths = new Set(matches.map((item) => item.project_key));
  const actualFundingSources = grants.filter((item) => ["grant", "tender", "finance", "fundraising"].includes(item.opportunity_type)).length;

  const countValues = {
    homeProjectCount: ledgerProjects.length,
    homeFundingSourceCount: grants.length,
    homeConnectionCount: entities.length,
    homeReviewedMatchCount: matches.length,
    mobileProjectCount: ledgerProjects.length,
    mobileFundingSourceCount: grants.length,
    mobileConnectionCount: entities.length,
    mobileReviewedMatchCount: matches.length,
  };
  Object.entries(countValues).forEach(([id, count]) => {
    const node = document.querySelector(`#${id}`);
    if (node) node.textContent = count;
  });

  const stats = document.querySelector("#homeStats");
  if (stats) {
    stats.innerHTML = [
      [ledgerProjects.length, "Community Ledger projects", "ledger-projects.html"],
      [actualFundingSources || grants.length, "funding opportunities", "grant-watchlist.html"],
      [entities.length, "potential local connections", "entities.html"],
      [`${projectKeysWithPaths.size}/${ledgerProjects.length}`, "projects with a mapped path", "grant-matches.html"],
    ].map(([number, label, href]) => `<a href="${href}"><strong>${number}</strong><span>${label}</span></a>`).join("");
  }

  const openGrants = grants
    .filter((item) => item.opportunity_type === "grant" && ["open", "rolling"].includes(item.availability) && Number.isFinite(deadlineTime(item)))
    .sort((a, b) => deadlineTime(a) - deadlineTime(b));
  const actionNow = document.querySelector("#homeActNowGrants") || document.querySelector("#homeActionNow") || document.querySelector("#homeGrantNow");
  if (actionNow) {
    actionNow.innerHTML = openGrants.slice(0, 5).map((item) => `
      <a class="deadline-row" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
        <time datetime="${escapeHtml(item.deadline_date || "")}">${formatActionDate(item.deadline_date)}</time>
        <span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.funding)}</small></span>
      </a>`).join("") || `<p class="empty-copy">No fixed-date open grant is recorded. Check rolling and prepare-next opportunities in the funding desk.</p>`;
  }

  const matchWeight = { act_now: 0, prepare_next: 1, build_pathway: 2, watch: 3 };
  const grouped = new Map();
  matches.forEach((item) => {
    if (!grouped.has(item.project_key)) grouped.set(item.project_key, []);
    grouped.get(item.project_key).push(item);
  });
  grouped.forEach((items) => items.sort((a, b) => (matchWeight[a.action_priority] ?? 9) - (matchWeight[b.action_priority] ?? 9) || (a.action_by || "9999").localeCompare(b.action_by || "9999")));
  const featuredKeys = ["ballow-road-sand-screen-hub", "quandamooka-film-festival", "straddie-maker-space-lab", "straddie-tip-loop-lab", "straddie-shared-table"];
  const momentum = document.querySelector("#homeMomentumStacks") || document.querySelector("#homeMomentum");
  if (momentum) {
    momentum.innerHTML = featuredKeys.map((key) => {
      const project = projectByKey.get(key);
      const layers = grouped.get(key) || [];
      if (!project) return "";
      const primary = layers[0];
      const grant = primary ? grantByKey.get(primary.grant_source_key) : null;
      return `<article class="momentum-card">
        <p class="tag">${primary ? availabilityLabel(grant?.availability) : "Pathway research"}</p>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(primary?.qualifying_reframe || project.summary)}</p>
        <div class="momentum-facts"><strong>${escapeHtml(grant?.funding || "Funding path being mapped")}</strong><span>${layers.length} funding layer${layers.length === 1 ? "" : "s"}</span></div>
        <p class="next-move"><span>Next move</span>${escapeHtml(primary?.next_move || "Add a source-backed pathway and identify the legal applicant.")}</p>
        <a class="text-link" href="grant-matches.html#project-${escapeHtml(key)}">Open stack</a>
      </article>`;
    }).join("");
  }

  const connections = document.querySelector("#homeConnections");
  if (connections) {
    const groups = entities.reduce((counts, item) => {
      const group = item.source_group || item.category || "Other local leads";
      counts[group] = (counts[group] || 0) + 1;
      return counts;
    }, {});
    const largest = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 5);
    connections.innerHTML = `<h3>Research leads, not agreements</h3><p>Public visibility does not prove eligibility, consent, endorsement, cultural authority, site control or capacity.</p><div class="connection-count"><strong>${entities.length}</strong><span>public discovery records</span></div>
      <div class="connection-groups">${largest.map(([name, count]) => `<span><b>${count}</b>${escapeHtml(name)}</span>`).join("")}</div>`;
  }

  const sourceDocs = document.querySelector("#homeSourceDocs") || document.querySelector("#sourceDocs");
  if (sourceDocs) {
    sourceDocs.innerHTML = docs.map((doc) => `<article class="source-item"><p class="tag">${escapeHtml(doc.type)}</p><h3>${escapeHtml(doc.title)}</h3><p>${escapeHtml(doc.summary)}</p></article>`).join("");
  }

  const homeCards = document.querySelector("#homeCards");
  if (homeCards) {
    homeCards.innerHTML = [
      ["Projects and funding stacks", `${ledgerProjects.length} live project concepts, ordered by the next useful funding move.`, "grant-matches.html"],
      ["Find grants", "Open rounds first, then prepare-next opportunities and source libraries.", "grant-watchlist.html"],
      ["Potential connections", `${entities.length} research leads to review by capability before anyone is approached.`, "entities.html"],
      ["Get ready", "Build the applicant profile, evidence pack, budget and reporting trail.", "profile-kit.html"],
      ["Earlier project ideas", `${projects.length} earlier concepts remain available for comparison.`, "projects.html"],
    ].map(([title, body, href]) => `<a class="link-card" href="${href}"><p class="tag">Open</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></a>`).join("");
  }
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
  const data = await loadJson("data/projects.json");
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
        { label: "Public Page", url: item.public_page },
        { label: "GitHub Repo", url: item.github_repo }
      ];
      return card(item.title, item.domain, item.summary, `Grant angles: ${item.grant_angles.join(", ")}`, "", actions, `project-${projectSlug}`, projectSlug === focusedProject ? "is-featured" : "");
    }).join("");
  };
  renderFilters(document.querySelector("#projectFilters"), unique(data.map((item) => item.domain)), draw);
  draw();
}

function emptyState(container, message) {
  container.innerHTML = `<article class="data-card empty-state"><p class="tag">Awaiting research</p><h3>No reviewed records yet</h3><p>${message}</p></article>`;
}

async function renderLedgerProjects() {
  const [data, matches, grants] = await Promise.all([
    loadJson("data/ledger-projects.json"),
    loadJson("data/grant-project-matches.json"),
    loadJson("data/grants.json")
  ]);
  const grid = document.querySelector("#ledgerProjectGrid");
  const search = document.querySelector("#projectSearch") || document.querySelector("#ledgerProjectSearch");
  const coverage = document.querySelector("#ledgerProjectCoverage");
  const summary = document.querySelector("#projectCatalogueSummary") || document.querySelector("#ledgerProjectSummary");
  const state = { query: "", coverage: "All" };
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const matchesByProject = new Map();
  matches.forEach((item) => {
    if (!matchesByProject.has(item.project_key)) matchesByProject.set(item.project_key, []);
    matchesByProject.get(item.project_key).push(item);
  });
  const priorityWeight = { act_now: 0, prepare_next: 1, build_pathway: 2, watch: 3 };
  matchesByProject.forEach((items) => items.sort((a, b) => (priorityWeight[a.action_priority] ?? 9) - (priorityWeight[b.action_priority] ?? 9) || (a.action_by || "9999").localeCompare(b.action_by || "9999")));
  if (summary) summary.innerHTML = `<div><strong>${data.length}</strong><span>ledger projects</span></div><div><strong>${matchesByProject.size}</strong><span>mapped funding pathways</span></div><div><strong>${matches.length}</strong><span>funding layers retained</span></div>`;
  const draw = () => {
    const query = state.query.toLowerCase();
    const items = data.filter((item) => {
      const hasPath = matchesByProject.has(item.project_key);
      const pathwayText = (matchesByProject.get(item.project_key) || []).map((match) => `${match.next_move || ""} ${match.qualifying_reframe || ""}`).join(" ");
      const coverageMatch = state.coverage === "All" || (state.coverage === "Mapped" && hasPath) || (state.coverage === "Needs pathway" && !hasPath);
      const searchMatch = !query || `${item.title} ${item.lane} ${item.summary} ${pathwayText}`.toLowerCase().includes(query);
      return coverageMatch && searchMatch;
    });
    grid.innerHTML = items.map((item) => {
      const layers = matchesByProject.get(item.project_key) || [];
      const primary = layers[0];
      const grant = primary ? grantByKey.get(primary.grant_source_key) : null;
      const actions = [
        { label: "Open public project", url: item.public_url },
        item.repository_url ? { label: "Open repository", url: item.repository_url } : null,
        { label: "Open funding stack", url: `grant-matches.html#project-${item.project_key}` }
      ];
      return card(item.title, item.lane, item.summary, grantFacts(grant, [
        ["Pathway coverage", layers.length ? `${layers.length} funding layer${layers.length === 1 ? "" : "s"}` : "Needs a source-backed pathway"],
        ["Next move", primary?.next_move || "Research the strongest grant, tender, finance or fundraising pathway."],
        ["Qualifying frame", primary?.qualifying_reframe || "Keep the public-benefit outcome clear without inventing eligibility."],
      ]), "", actions.filter(Boolean), `ledger-${item.project_key}`, primary?.action_priority === "act_now" ? "is-featured" : "");
    }).join("");
  };
  if (search) search.addEventListener("input", () => { state.query = search.value; draw(); });
  if (coverage) coverage.addEventListener("change", () => { state.coverage = coverage.value; draw(); });
  if (!coverage) renderFilters(document.querySelector("#ledgerProjectFilters"), ["Mapped", "Needs pathway"], (filter) => { state.coverage = filter; draw(); });
  draw();
}

async function renderGrantMatches() {
  const [matches, projects, grants] = await Promise.all([
    loadJson("data/grant-project-matches.json"),
    loadJson("data/ledger-projects.json"),
    loadJson("data/grants.json")
  ]);
  const projectByKey = new Map(projects.map((item) => [item.project_key, item]));
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const grid = document.querySelector("#grantMatchGrid");
  if (!matches.length) {
    emptyState(grid, "The weekly scan will place source-backed project matches here after it finds a credible fit.");
    return;
  }
  const draw = (filter = "All") => {
    const items = filter === "All" ? matches : matches.filter((item) => item.fit_status === filter);
    grid.innerHTML = items.map((item) => {
      const project = projectByKey.get(item.project_key);
      const grant = grantByKey.get(item.grant_source_key);
      const evidence = item.evidence_needed.length ? item.evidence_needed.join(", ") : "No evidence list recorded";
      const actions = [
        project ? { label: "Open project", url: project.public_url } : null,
        grant ? { label: "Open grant source", url: grant.url } : null
      ];
      return card(
        `${project?.title || item.project_key} × ${grant?.name || item.grant_source_key}`,
        item.fit_status,
        item.fit_reason,
        grantFacts(grant, [
          ["Fit", item.fit_status],
          ["Eligibility", item.eligibility_status],
          ["Evidence needed", evidence],
          ["Checked", item.last_checked]
        ]),
        "",
        actions.filter(Boolean)
      );
    }).join("");
  };
  renderFilters(document.querySelector("#grantMatchFilters"), unique(matches.map((item) => item.fit_status)), draw);
  draw();
}

async function renderGrantActionQueue() {
  const [matches, projects, grants] = await Promise.all([
    loadJson("data/grant-project-matches.json"),
    loadJson("data/ledger-projects.json"),
    loadJson("data/grants.json")
  ]);
  const projectByKey = new Map(projects.map((item) => [item.project_key, item]));
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const grid = document.querySelector("#grantMatchGrid");
  const summary = document.querySelector("#grantMatchSummary");
  const filters = document.querySelector("#grantMatchFilters");
  if (!matches.length) {
    emptyState(grid, "The weekly scan will place source-backed project pathways here after it finds a credible fit.");
    return;
  }

  const priorityWeight = { act_now: 0, prepare_next: 1, build_pathway: 2, watch: 3 };
  const priorityLabel = {
    act_now: "Act now",
    prepare_next: "Prepare next",
    build_pathway: "Build pathway",
    watch: "Watch"
  };
  const sortMatches = (items) => [...items].sort((a, b) => {
    const priorityDifference = (priorityWeight[a.action_priority] ?? 9) - (priorityWeight[b.action_priority] ?? 9);
    if (priorityDifference) return priorityDifference;
    const dateA = a.action_by || "9999-12-31";
    const dateB = b.action_by || "9999-12-31";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (projectByKey.get(a.project_key)?.title || a.project_key).localeCompare(projectByKey.get(b.project_key)?.title || b.project_key);
  });
  const ordered = sortMatches(matches);
  const matchesByProject = new Map();
  ordered.forEach((item) => {
    if (!matchesByProject.has(item.project_key)) matchesByProject.set(item.project_key, []);
    matchesByProject.get(item.project_key).push(item);
  });
  const primary = [...matchesByProject.values()].map((items) => items[0]);
  const pathwayGapCount = projects.length - matchesByProject.size;
  const actNowCount = primary.filter((item) => item.action_priority === "act_now").length;

  if (summary) {
    summary.innerHTML = `
      <div><strong>${actNowCount}</strong><span>projects need action now</span></div>
      <div><strong>${matchesByProject.size}/${projects.length}</strong><span>ledger projects have a mapped pathway</span></div>
      <div><strong>${matches.length}</strong><span>small and large funding layers retained</span></div>
      <p>${pathwayGapCount ? `${pathwayGapCount} project pathways still need a source-backed route added.` : "Every ledger project has at least one funding pathway. Small grants stay in the stack."}</p>`;
  }

  const renderProjectStack = (item) => {
    const project = projectByKey.get(item.project_key);
    const grant = grantByKey.get(item.grant_source_key);
    const layers = matchesByProject.get(item.project_key) || [];
    const secondary = layers.slice(1);
    const layerMarkup = secondary.length ? `<div class="stack-layers"><p>Keep these layers</p>${secondary.map((candidate) => {
      const candidateGrant = grantByKey.get(candidate.grant_source_key);
      return `<a href="${escapeHtml(candidateGrant?.url || "grant-watchlist.html")}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(candidate.stack_role || "Funding layer")}</span><b>${escapeHtml(candidateGrant?.funding || "Amount to verify")}</b><small>${escapeHtml(candidateGrant?.name || candidate.grant_source_key)}</small></a>`;
    }).join("")}</div>` : "";
    return `<article class="funding-stack-card" id="project-${escapeHtml(item.project_key)}">
      <header>
        <p class="tag">${escapeHtml(priorityLabel[item.action_priority] || item.fit_status)}${item.action_by ? ` · action by ${escapeHtml(formatActionDate(item.action_by))}` : ""}</p>
        <h2>${escapeHtml(project?.title || item.project_key)}</h2>
        <p>${escapeHtml(project?.summary || item.fit_reason)}</p>
      </header>
      <section class="primary-funding">
        <div class="primary-funding-title"><span>${escapeHtml(item.stack_role || "Primary pathway")}</span><h3>${escapeHtml(grant?.name || item.grant_source_key)}</h3></div>
        <strong class="funding-amount">${escapeHtml(item.funding_ask || grant?.funding || "Amount to verify")}</strong>
        <dl class="compact-facts">
          <div><dt>Official funding</dt><dd>${escapeHtml(grant?.funding || "Unknown — check source")}</dd></div>
          <div><dt>Deadline</dt><dd>${escapeHtml(grant?.deadline || "No fixed date")}</dd></div>
          <div><dt>Applicant gate</dt><dd>${escapeHtml(grant?.applicants || item.eligibility_status)}</dd></div>
        </dl>
      </section>
      ${layerMarkup}
      <div class="stack-next"><span>Next human move</span><p>${escapeHtml(item.next_move)}</p></div>
      <div class="stack-cofund"><span>Possible co-funding</span><p>${escapeHtml(item.cofunding_plan)}</p></div>
      <details class="stack-detail">
        <summary>Reframe, co-funding, people and evidence</summary>
        <dl class="card-facts">
          <div><dt>Qualifying reframe</dt><dd>${escapeHtml(item.qualifying_reframe)}</dd></div>
          <div><dt>Why it fits</dt><dd>${escapeHtml(item.fit_reason)}</dd></div>
          <div><dt>Eligibility still to prove</dt><dd>${escapeHtml(item.eligibility_status)}</dd></div>
          <div><dt>Readiness check</dt><dd>${escapeHtml(item.readiness_check)}</dd></div>
          <div><dt>Co-funding path</dt><dd>${escapeHtml(item.cofunding_plan)}</dd></div>
          <div><dt>Humans needed</dt><dd>${escapeHtml(sentenceList(item.human_roles))}</dd></div>
          <div><dt>AI work</dt><dd>${escapeHtml(sentenceList(item.ai_tasks))}</dd></div>
          <div><dt>Evidence needed</dt><dd>${escapeHtml(sentenceList(item.evidence_needed))}</dd></div>
        </dl>
      </details>
      <div class="card-actions">
        ${project?.public_url ? `<a href="${escapeHtml(project.public_url)}" target="_blank" rel="noopener noreferrer">Open project</a>` : ""}
        ${grant?.url ? `<a href="${escapeHtml(grant.url)}" target="_blank" rel="noopener noreferrer">Check official source</a>` : ""}
      </div>
    </article>`;
  };

  const draw = (filter = "All") => {
    const items = filter === "All" ? primary : primary.filter((item) => item.action_priority === filter);
    grid.innerHTML = sortMatches(items).map((item) => renderProjectStack(item)).join("");
  };

  if (filters) {
    const available = Object.keys(priorityLabel).filter((key) => primary.some((item) => item.action_priority === key));
    filters.innerHTML = ["All", ...available].map((key, index) => {
      const label = key === "All" ? "All priorities" : priorityLabel[key];
      return `<button type="button" class="${index === 0 ? "is-active" : ""}" data-filter="${key}">${label}</button>`;
    }).join("");
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
      draw(button.dataset.filter);
    });
  }
  draw();
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
  const matchByPair = new Map(matches.map((item) => [`${item.project_key}::${item.grant_source_key}`, item]));
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
      const candidates = item.candidate_partners.length
        ? item.candidate_partners.map((candidate) => `${candidate.name} — ${candidate.proposed_role} — ${candidate.assent_status}`).join("; ")
        : `No person or organisation assigned. Review the ${entities.length} public discovery records by capability.`;
      return card(
        project?.title || item.project_key,
        item.planning_status === "research_only" ? "Research-only role map" : item.planning_status.replaceAll("_", " "),
        item.boundary_note,
        grantFacts(grant, [
          ["Roles to fill", item.roles_needed.join("; ")],
          ["Possible candidates", candidates],
          ["Next project move", match?.next_move || "Confirm the required role before reviewing names."],
          ["Checked", item.last_checked]
        ]),
        "",
        [
          project ? { label: "Open project", url: project.public_url } : null,
          grant ? { label: "Open grant source", url: grant.url } : null,
          { label: "Browse potential connections", url: "entities.html" }
        ].filter(Boolean)
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
  const items = data.filter((item) => item.level === level);
  const grid = document.querySelector("#grantGrid");
  grid.innerHTML = items.map((item) => card(item.name, item.status, item.best_for, grantFacts(item, [["Checked", item.last_checked]]), item.url)).join("");
}

async function renderWindows() {
  const [data, grants] = await Promise.all([
    loadJson("data/grant-windows.json"),
    loadJson("data/grants.json")
  ]);
  const grantByKey = new Map(grants.map((item) => [item.source_key, item]));
  const grid = document.querySelector("#windowGrid");
  const draw = (filter = "All") => {
    const items = filter === "All" ? data : data.filter((item) => item.window_type === filter);
    grid.innerHTML = items.map((item) => card(item.title, item.window_type, item.tip, grantFacts(grantByKey.get(item.source_key), [["Who should care", item.notify], ["Action", item.action]]))).join("");
  };
  renderFilters(document.querySelector("#windowFilters"), unique(data.map((item) => item.window_type)), draw);
  draw();
}

async function renderWatchlist() {
  const data = await loadJson("data/grant-watchlist.json");
  const legacyGrid = document.querySelector("#watchlistGrid");
  const filters = document.querySelector("#watchlistFilters");
  const summary = document.querySelector("#fundingSummary");
  const modeOf = (item) => {
    if (item.availability === "closed" || /closed|retired|past/i.test(item.status || "")) return "past";
    if (["support_information", "partner_watch"].includes(item.opportunity_type)) return "past";
    if (["program_list", "search_portal"].includes(item.opportunity_type)) return "sources";
    if (item.opportunity_type !== "grant") return "sources";
    if (["open", "rolling"].includes(item.availability)) return "open";
    return "prepare";
  };
  const labels = { open: "Open now", prepare: "Prepare next", sources: "Source library", past: "Past and watch" };
  const order = { open: 0, prepare: 1, sources: 2, past: 3 };
  const sorted = [...data].sort((a, b) => order[modeOf(a)] - order[modeOf(b)] || deadlineTime(a) - deadlineTime(b) || a.title.localeCompare(b.title));
  let selected = "open";
  const renderItems = (items) => items.length ? items.map((item) => card(
      item.title,
      availabilityLabel(item.availability),
      item.summary,
      grantFacts(item, [["Level", item.level_label], ["What to do", item.action], ["Official status", item.status || "Status check needed"], ["Checked", item.last_checked]]),
      item.source_url
    )).join("") : `<article class="data-card empty-state"><p class="tag">Nothing listed</p><h3>No items in this view</h3><p>Check another funding view or the official source library.</p></article>`;
  const panelGrids = {
    open: document.querySelector("#fundingOpenGrid"),
    prepare: document.querySelector("#fundingPrepareGrid"),
    sources: document.querySelector("#fundingSourcesGrid"),
    past: document.querySelector("#fundingPastGrid"),
  };
  Object.entries(panelGrids).forEach(([key, grid]) => {
    if (grid) grid.innerHTML = renderItems(sorted.filter((item) => modeOf(item) === key));
  });
  const draw = () => {
    if (legacyGrid && !legacyGrid.hidden) legacyGrid.innerHTML = renderItems(sorted.filter((item) => modeOf(item) === selected));
  };
  if (summary) {
    const counts = Object.fromEntries(Object.keys(labels).map((key) => [key, data.filter((item) => modeOf(item) === key).length]));
    summary.innerHTML = Object.entries(labels).map(([key, label]) => `<div><strong>${counts[key]}</strong><span>${label}</span></div>`).join("");
  }
  if (filters) {
    filters.innerHTML = Object.entries(labels).map(([key, label], index) => `<button type="button" class="${index === 0 ? "is-active" : ""}" data-filter="${key}">${label}</button>`).join("");
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      selected = button.dataset.filter;
      filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
      draw();
    });
  }
  const viewTabs = document.querySelector("#fundingViewTabs");
  if (viewTabs) {
    const panels = document.querySelectorAll("[data-funding-panel]");
    const showPanel = (key) => {
      panels.forEach((panel) => { panel.hidden = panel.dataset.fundingPanel !== key; });
      viewTabs.querySelectorAll("[data-funding-view]").forEach((button) => {
        const active = button.dataset.fundingView === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
      });
    };
    viewTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-funding-view]");
      if (button) showPanel(button.dataset.fundingView);
    });
    showPanel("open");
  }
  draw();
}

async function boot() {
  try {
    const page = document.body.dataset.page;
    if (page === "home") await renderHome();
    if (page === "entities") await renderEntities();
    if (page === "projects") await renderProjects();
    if (page === "ledger-projects") await renderLedgerProjects();
    if (page === "grant-matches") await renderGrantActionQueue();
    if (page === "partner-pathways") await renderPartnerPathways();
    if (page === "grants") await renderGrants();
    if (page === "windows") await renderWindows();
    if (page === "watchlist") await renderWatchlist();
    if (page === "profile") renderProfileKit();
  } catch (error) {
    const main = document.querySelector("main");
    if (main) main.insertAdjacentHTML("beforeend", `<p class="load-error">${error.message}. If you opened the file directly, run a local server first.</p>`);
  }
}

boot();
