const navHtml = `
  <nav class="nav" aria-label="Main navigation">
    <a class="brand-mark" href="index.html"><span>Stradbroke</span><span>Grants Lab</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
    <div class="nav-links" id="nav-links">
      <a href="entities.html">Island Entities</a>
      <a href="projects.html">Projects</a>
      <a href="grant-watchlist.html">Watchlist</a>
      <a href="federal-grants.html">Federal</a>
      <a href="queensland-grants.html">Queensland</a>
      <a href="council-grants.html">Council</a>
      <a href="indigenous-grants.html">First Nations</a>
      <a href="global-grants.html">Global</a>
      <a href="island-grants.html">Island</a>
      <a href="grant-windows.html">Windows</a>
      <a href="profile-kit.html">Profile Kit</a>
      <a href="workflow.html">Workflow</a>
    </div>
  </nav>`;

const footerHtml = `
  <p>Stradbroke Grants Lab. Built as a Strange But True service layer for practical grant work.</p>
  <p><a href="https://auraofintelligence.github.io/strange-but-true/grants-ideas.html">Grant writing service</a> | <a href="https://auraofintelligence.github.io/strange-but-true/">Strange But True</a></p>`;

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
  if (link.getAttribute("href") === currentFile) link.setAttribute("aria-current", "page");
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

function card(title, tag, body, meta, url, actions = [], id = "") {
  const fallbackAction = url ? [{ label: "Open source", url }] : [];
  const actionItems = [...fallbackAction, ...actions].filter((action) => action && action.url);
  const actionLinks = actionItems.length
    ? `<div class="card-actions">${actionItems.map((action) => `<a href="${action.url}" target="_blank" rel="noopener noreferrer">${action.label}</a>`).join("")}</div>`
    : "";
  const anchor = id ? ` id="${id}"` : "";
  return `<article class="data-card"${anchor}><p class="tag">${tag || "Item"}</p><h3>${title}</h3><p>${body}</p>${meta ? `<p class="meta">${meta}</p>` : ""}${actionLinks}</article>`;
}

function unique(items) {
  return [...new Set(items)].filter(Boolean).sort();
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
  const [grants, projects, entities, docs] = await Promise.all([
    loadJson("data/grants.json"),
    loadJson("data/projects.json"),
    loadJson("data/entities.json"),
    loadJson("data/source-docs.json"),
  ]);
  const homeCards = document.querySelector("#homeCards");
  if (homeCards) {
    homeCards.innerHTML = [
      ["Grant watchlist", "Generated shortlist from all grant sources, levels and timing windows.", "grant-watchlist.html"],
      ["Island entities", `${entities.length} starter applicant records from businesses, clubs, non-profits, artists and civic groups.`, "entities.html"],
      ["Project catalogue", `${projects.length} Strange But True and island project concepts ready for grant matching.`, "projects.html"],
      ["Grant windows", "Noticeboard-ready hints for new, closing, future and rolling grant opportunities.", "grant-windows.html"],
    ].map(([title, body, href]) => `<a class="link-card" href="${href}"><p class="tag">Open</p><h3>${title}</h3><p>${body}</p></a>`).join("");
  }
  const sourceDocs = document.querySelector("#sourceDocs");
  if (sourceDocs) {
    sourceDocs.innerHTML = docs.map((doc) => `<article class="source-item"><p class="tag">${doc.type}</p><h3>${doc.title}</h3><p>${doc.summary}</p></article>`).join("");
  }
  const windowPreview = document.querySelector("#windowPreview");
  if (windowPreview) {
    const windows = await loadJson("data/grant-windows.json");
    windowPreview.innerHTML = windows.slice(0, 3).map((item) => `<a class="link-card" href="grant-windows.html"><p class="tag">${item.window_type}</p><h3>${item.title}</h3><p>${item.tip}</p></a>`).join("");
  }
}

async function renderEntities() {
  const data = await loadJson("data/entities.json");
  const grid = document.querySelector("#entityGrid");
  const search = document.querySelector("#entitySearch");
  const placeArea = document.querySelector("#placeAreaFilter");
  const sortButtons = document.querySelectorAll("[data-entity-sort]");
  const state = { filter: "All", place: "All", query: "", sort: "default" };
  const townOf = (item) => item.town || item.location || "Island-wide";
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
  const priorityOf = (item) => {
    const haystack = `${item.name} ${item.category} ${item.location}`.toLowerCase();
    if (item.category === "Emergency service") return 0;
    if (haystack.includes("yulu") || haystack.includes("yuli")) return 1;
    if (haystack.includes("doctor") || haystack.includes("medical") || haystack.includes("marie rose")) return 2;
    if (haystack.includes("ranger")) return 3;
    if (haystack.includes("transport") || haystack.includes("sealink") || haystack.includes("flyer") || haystack.includes("bus")) return 4;
    return 10;
  };
  const compareText = (a, b, selector) => selector(a).localeCompare(selector(b));
  const sortItems = (items) => {
    const sorted = [...items];
    if (state.sort === "az") return sorted.sort((a, b) => compareText(a, b, (item) => item.name));
    if (state.sort === "za") return sorted.sort((a, b) => compareText(b, a, (item) => item.name));
    return sorted.sort((a, b) => priorityOf(a) - priorityOf(b) || compareText(a, b, (item) => item.name));
  };
  const draw = () => {
    const query = state.query.trim().toLowerCase();
    const items = data.filter((item) => {
      const filterMatch = state.filter === "All" || item.category === state.filter;
      const placeMatch = state.place === "All" || item.place_area === state.place;
      const searchMatch = !query || `${item.name} ${item.category} ${item.location} ${item.town || ""} ${item.place_area || ""} ${item.grant_fit}`.toLowerCase().includes(query);
      return filterMatch && placeMatch && searchMatch;
    });
    grid.innerHTML = sortItems(items).map((item) => card(item.name, item.category, item.grant_fit, `${item.place_area || "Unknown"} | ${townOf(item)} | ${item.status}`)).join("");
  };
  if (search) search.addEventListener("input", () => {
    state.query = search.value;
    draw();
  });
  if (placeArea) placeArea.addEventListener("change", () => {
    state.place = placeArea.value;
    draw();
  });
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.sort = button.dataset.entitySort || "default";
      sortButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      draw();
    });
  });
  renderFilters(document.querySelector("#entityFilters"), unique(data.map((item) => item.category)), (filter) => {
    state.filter = filter || "All";
    draw();
  });
  updatePlaceOptions();
  draw();
}

async function renderProjects() {
  const data = await loadJson("data/projects.json");
  const grid = document.querySelector("#projectGrid");
  const draw = (filter = "All") => {
    const items = filter === "All" ? data : data.filter((item) => item.domain === filter);
    grid.innerHTML = items.map((item) => {
      const actions = [
        { label: "Public Page", url: item.public_page },
        { label: "GitHub Repo", url: item.github_repo }
      ];
      return card(item.title, item.domain, item.summary, `Grant angles: ${item.grant_angles.join(", ")}`, "", actions, `project-${slugify(item.title)}`);
    }).join("");
  };
  renderFilters(document.querySelector("#projectFilters"), unique(data.map((item) => item.domain)), draw);
  draw();
}

async function renderGrants() {
  const data = await loadJson("data/grants.json");
  const level = document.body.dataset.level;
  const items = data.filter((item) => item.level === level);
  const grid = document.querySelector("#grantGrid");
  grid.innerHTML = items.map((item) => card(item.name, item.status, item.best_for, `${item.level_label} | ${item.last_checked}`, item.url)).join("");
}

async function renderWindows() {
  const data = await loadJson("data/grant-windows.json");
  const grid = document.querySelector("#windowGrid");
  const draw = (filter = "All") => {
    const items = filter === "All" ? data : data.filter((item) => item.window_type === filter);
    grid.innerHTML = items.map((item) => card(item.title, item.window_type, item.tip, `Notify: ${item.notify} | Action: ${item.action}`)).join("");
  };
  renderFilters(document.querySelector("#windowFilters"), unique(data.map((item) => item.window_type)), draw);
  draw();
}

async function renderWatchlist() {
  const data = await loadJson("data/grant-watchlist.json");
  const grid = document.querySelector("#watchlistGrid");
  const draw = (filter = "All") => {
    const items = filter === "All" ? data : data.filter((item) => item.level === filter || item.window_type === filter);
    grid.innerHTML = items.map((item) => card(item.title, item.priority, item.summary, `${item.level_label} | ${item.window_type} | ${item.action}`, item.source_url)).join("");
  };
  renderFilters(document.querySelector("#watchlistFilters"), unique(data.flatMap((item) => [item.level, item.window_type])), draw);
  draw();
}

async function boot() {
  try {
    const page = document.body.dataset.page;
    if (page === "home") await renderHome();
    if (page === "entities") await renderEntities();
    if (page === "projects") await renderProjects();
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
