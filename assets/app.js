const navHtml = `
  <nav class="nav" aria-label="Main navigation">
    <a class="brand-mark" href="index.html"><span>Stradbroke</span><span>Grants Lab</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
    <div class="nav-links" id="nav-links">
      <a href="entities.html">Island Entities</a>
      <a href="projects.html">Projects</a>
      <a href="health-housing-emergency.html">Health/Housing</a>
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

function card(title, tag, body, meta, url) {
  const link = url ? `<p class="meta"><a href="${url}" target="_blank" rel="noopener noreferrer">Open source</a></p>` : "";
  return `<article class="data-card"><p class="tag">${tag || "Item"}</p><h3>${title}</h3><p>${body}</p>${meta ? `<p class="meta">${meta}</p>` : ""}${link}</article>`;
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
      ["Grant watchlist", `${grants.length} starter grant pathways across federal, Queensland, council, First Nations, global and island levels.`, "federal-grants.html"],
      ["Island entities", `${entities.length} starter applicant records from businesses, clubs, non-profits, artists and civic groups.`, "entities.html"],
      ["Project catalogue", `${projects.length} Strange But True and island project concepts ready for grant matching.`, "projects.html"],
      ["Core services", "Health, housing, aged care, Elders, police, ambulance, fire, VMR and emergency readiness.", "health-housing-emergency.html"],
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
  const coreServiceCards = document.querySelector("#coreServiceCards");
  if (coreServiceCards) {
    const coreCategories = ["Elders and cultural governance", "Health service", "Housing and aged care", "Emergency service"];
    coreServiceCards.innerHTML = coreCategories.map((category) => {
      const count = entities.filter((item) => item.category === category).length;
      return `<a class="link-card" href="health-housing-emergency.html"><p class="tag">${count} entries</p><h3>${category}</h3><p>Open the dedicated core-services lane for grant matching and noticeboard preparation.</p></a>`;
    }).join("");
  }
}

async function renderEntities() {
  const data = await loadJson("data/entities.json");
  const grid = document.querySelector("#entityGrid");
  const draw = (filter = "All") => {
    const items = filter === "All" ? data : data.filter((item) => item.category === filter);
    grid.innerHTML = items.map((item) => card(item.name, item.category, item.grant_fit, `${item.location} | ${item.status}`)).join("");
  };
  renderFilters(document.querySelector("#entityFilters"), unique(data.map((item) => item.category)), draw);
  draw();
}

async function renderProjects() {
  const data = await loadJson("data/projects.json");
  const grid = document.querySelector("#projectGrid");
  const draw = (filter = "All") => {
    const items = filter === "All" ? data : data.filter((item) => item.domain === filter);
    grid.innerHTML = items.map((item) => card(item.title, item.domain, item.summary, `Grant angles: ${item.grant_angles.join(", ")}`)).join("");
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

async function renderCoreServices() {
  const data = await loadJson("data/entities.json");
  const coreCategories = ["Elders and cultural governance", "Health service", "Housing and aged care", "Emergency service"];
  const items = data.filter((item) => coreCategories.includes(item.category));
  const grid = document.querySelector("#coreServiceGrid");
  const draw = (filter = "All") => {
    const filtered = filter === "All" ? items : items.filter((item) => item.category === filter);
    grid.innerHTML = filtered.map((item) => card(item.name, item.category, item.grant_fit, `${item.location} | ${item.status}`)).join("");
  };
  renderFilters(document.querySelector("#coreServiceFilters"), coreCategories, draw);
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
    if (page === "core-services") await renderCoreServices();
  } catch (error) {
    const main = document.querySelector("main");
    if (main) main.insertAdjacentHTML("beforeend", `<p class="load-error">${error.message}. If you opened the file directly, run a local server first.</p>`);
  }
}

boot();
