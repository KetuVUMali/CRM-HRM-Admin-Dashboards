/* ==========================================================================
   HRM DASHBOARD — SHARED COMPONENTS
   Renders the sidebar, header, breadcrumb and various reusable widgets into
   placeholder containers that every page includes. Keeping this logic in
   one place means every page stays visually and functionally consistent.
   ========================================================================== */

const THEME_LIST = [
  { key: "professional-blue", name: "Professional Blue", swatch: "#465fff", scheme: "light" },
  { key: "modern-purple", name: "Modern Purple", swatch: "#8b5cf6", scheme: "light" },
  { key: "emerald", name: "Emerald", swatch: "#059669", scheme: "light" },
  { key: "dark-saas", name: "Dark SaaS", swatch: "#6d83f7", scheme: "dark" },
  { key: "high-contrast", name: "High Contrast", swatch: "#0047ab", scheme: "light" }
];
const DEFAULT_THEME = "professional-blue";
const DEFAULT_DARK_THEME = "dark-saas";

/* Resolves and applies the effective theme.
   - hrmThemeMode "system"  → follow prefers-color-scheme, using the user's
     last chosen light theme (hrmLightTheme) or Dark SaaS for the dark side.
   - hrmThemeMode "manual"  → use hrmTheme exactly as chosen. */
function getEffectiveTheme() {
  const mode = localStorage.getItem("hrmThemeMode") || "manual";
  if (mode === "system") {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? DEFAULT_DARK_THEME : (localStorage.getItem("hrmLightTheme") || DEFAULT_THEME);
  }
  return localStorage.getItem("hrmTheme") || DEFAULT_THEME;
}

function applyStoredTheme() {
  document.documentElement.setAttribute("data-theme", getEffectiveTheme());
}
applyStoredTheme();

function applyStoredDensity() {
  document.documentElement.setAttribute("data-density", localStorage.getItem("hrmDensity") || "comfortable");
}
applyStoredDensity();

// Keep in sync if the OS-level color scheme changes while in "system" mode
if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ((localStorage.getItem("hrmThemeMode") || "manual") === "system") applyStoredTheme();
  });
}

function setTheme(key) {
  localStorage.setItem("hrmTheme", key);
  localStorage.setItem("hrmThemeMode", "manual");
  const meta = THEME_LIST.find(t => t.key === key);
  if (meta && meta.scheme === "light") localStorage.setItem("hrmLightTheme", key);
  applyStoredTheme();
}

function setThemeMode(mode) {
  localStorage.setItem("hrmThemeMode", mode);
  applyStoredTheme();
}

/* ---------------------------------------------------------------------- */
/* SIDEBAR                                                                  */
/* ---------------------------------------------------------------------- */

function renderSidebar(activeHref) {
  const mount = document.getElementById("appSidebar");
  if (!mount) return;
  const user = getCurrentUser();

  const groupsHtml = navigation.map(group => {
    const items = group.items.filter(it => it.roles.includes("all") || it.roles.includes(user.role));
    if (!items.length) return "";
    const itemsHtml = items.map(it => {
      const isActive = it.href === activeHref;
      return `<li><a class="sidebar-link ${isActive ? "active" : ""}" href="${it.href}">
        <i class="bi ${it.icon} nav-ic"></i><span class="link-label">${it.title}</span>
      </a></li>`;
    }).join("");
    return `<div class="sidebar-group-label"><span>${group.group}</span></div><ul class="sidebar-nav">${itemsHtml}</ul>`;
  }).join("");

  mount.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-mark"><i class="bi bi-people-fill"></i></div>
      <div class="sidebar-brand-text">
        <div class="sidebar-brand-name">NimbusHR</div>
        <div class="sidebar-brand-sub">Enterprise HRMS</div>
      </div>
      <button class="sidebar-close-btn" id="sidebarCloseBtn" type="button" aria-label="Close menu"><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="sidebar-scroll">${groupsHtml}</div>
    <div class="sidebar-foot">
      <button class="sidebar-collapse-btn desktop-collapse-btn" id="sidebarCollapseBtn" type="button">
        <i class="bi bi-layout-sidebar-inset"></i><span class="link-label">Collapse</span>
      </button>
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* HEADER                                                                   */
/* ---------------------------------------------------------------------- */

function renderHeader(pageTitle, breadcrumbTrail) {
  const mount = document.getElementById("appHeader");
  if (!mount) return;
  const user = getCurrentUser();
  const unread = notifications.filter(n => !n.read).length;

  const crumbHtml = (breadcrumbTrail || []).map((c, i, arr) => {
    const isLast = i === arr.length - 1;
    return isLast ? `<span class="current">${c}</span>` : `<a href="dashboard.html">${c}</a><span class="sep">/</span>`;
  }).join("");

  const isSystemMode = (localStorage.getItem("hrmThemeMode") || "manual") === "system";
  const effectiveTheme = getEffectiveTheme();
  const themeRows = THEME_LIST.map(t => `
    <button type="button" class="theme-row ${!isSystemMode && effectiveTheme === t.key ? "active" : ""}" data-theme-key="${t.key}">
      <span class="theme-row-swatch" style="background:${t.swatch}"></span>
      <span class="theme-row-name">${t.name}</span>
      ${!isSystemMode && effectiveTheme === t.key ? '<i class="bi bi-check-lg"></i>' : ""}
    </button>`).join("");

  const roleSwitchItems = roles.map(r => `<li><a class="dropdown-item ${user.role === r ? "active" : ""}" href="#" data-role="${r}">${roleLabels[r]}</a></li>`).join("");

  const notifItems = notifications.slice(0, 6).map(n => `
    <div class="notif-item ${n.read ? "" : "unread"}">
      <div class="notif-ic bg-tint-${n.tint}"><i class="bi ${n.icon}"></i></div>
      <div>
        <div style="font-size:.82rem;font-weight:600;">${n.type}</div>
        <div style="font-size:.78rem;color:var(--text-secondary);">${n.message}</div>
        <div style="font-size:.7rem;color:var(--text-muted);margin-top:2px;">${n.time}</div>
      </div>
    </div>`).join("");

  mount.innerHTML = `
    <button class="header-icon-btn mobile-toggle-btn" id="mobileSidebarBtn" type="button" aria-label="Open menu"><i class="bi bi-list"></i></button>

    <div class="d-none d-md-block">
      <div class="breadcrumb-row">${crumbHtml}</div>
      <div class="page-title" style="font-size:1.05rem;">${pageTitle}</div>
    </div>

    <div class="header-search ms-lg-3 d-none d-md-block">
      <i class="bi bi-search"></i>
      <input type="text" id="globalSearchInput" placeholder="Search or type a command…" autocomplete="off" readonly>
      <span class="kbd-hint"><i class="bi bi-command"></i>K</span>
    </div>

    <div class="ms-auto d-flex align-items-center gap-2">
      <button class="header-icon-btn d-md-none" id="mobileSearchBtn" type="button" title="Search" aria-label="Search"><i class="bi bi-search"></i></button>

      <div class="dropdown">
        <button class="header-icon-btn" data-bs-toggle="dropdown" title="Appearance" type="button"><i class="bi bi-palette"></i></button>
        <div class="dropdown-menu dropdown-menu-end p-2" style="min-width:240px;">
          <div class="dropdown-header px-2 pt-1 mb-1">Appearance</div>
          <button type="button" class="theme-row ${isSystemMode ? "active" : ""}" id="systemThemeToggle">
            <span class="theme-row-swatch" style="background:linear-gradient(135deg,#465fff 50%,#12151f 50%)"></span>
            <span class="theme-row-name">Match system</span>
            ${isSystemMode ? '<i class="bi bi-check-lg"></i>' : ""}
          </button>
          <div class="dropdown-divider my-2"></div>
          <div class="px-2 pb-1" style="font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;font-weight:700;">Theme</div>
          ${themeRows}
          <div class="dropdown-divider my-2"></div>
          <a class="dropdown-item d-flex align-items-center gap-2" href="settings.html"><i class="bi bi-sliders"></i>More appearance settings</a>
        </div>
      </div>

      <div class="dropdown d-none d-sm-block">
        <button class="header-icon-btn" data-bs-toggle="dropdown" title="Notifications" type="button">
          <i class="bi bi-bell"></i>${unread ? '<span class="dot"></span>' : ""}
        </button>
        <div class="dropdown-menu dropdown-menu-end p-0" style="width:340px;">
          <div class="dropdown-header px-3 pt-3 pb-2 d-flex justify-content-between align-items-center">
            <span>Notifications</span><span class="badge-status st-pending">${unread} new</span>
          </div>
          <div style="max-height:320px;overflow-y:auto;">${notifItems}</div>
          <div class="text-center p-2 border-top" style="border-color:var(--border-color)!important;"><a href="#" style="font-size:.8rem;font-weight:600;">View all notifications</a></div>
        </div>
      </div>

      <div class="dropdown d-none d-sm-block">
        <button class="header-icon-btn" title="Help" type="button"><i class="bi bi-question-circle"></i></button>
      </div>

      <div class="dropdown">
        <div class="avatar-btn" data-bs-toggle="dropdown">
          <img src="${user.avatar}" class="avatar-img" alt="${user.name}">
          <div class="d-none d-lg-block">
            <div style="font-size:.83rem;font-weight:700;line-height:1.1;">${user.name}</div>
            <div style="font-size:.72rem;color:var(--text-muted);">${roleLabels[user.role]}</div>
          </div>
          <i class="bi bi-chevron-down d-none d-lg-block" style="font-size:.7rem;color:var(--text-muted);"></i>
        </div>
        <div class="dropdown-menu dropdown-menu-end" style="min-width:230px;">
          <div class="dropdown-header">My Account</div>
          <a class="dropdown-item" href="employee-profile.html"><i class="bi bi-person me-2"></i>My Profile</a>
          <a class="dropdown-item" href="settings.html"><i class="bi bi-gear me-2"></i>Account Settings</a>
          <a class="dropdown-item" href="#"><i class="bi bi-shield-lock me-2"></i>Change Password</a>
          <a class="dropdown-item" href="settings.html"><i class="bi bi-clock-history me-2"></i>Activity Log</a>
          <div class="dropdown-divider"></div>
          <div class="dropdown-header">View as (demo)</div>
          <ul class="list-unstyled mb-0">${roleSwitchItems}</ul>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" href="index.html"><i class="bi bi-box-arrow-right me-2"></i>Logout</a>
        </div>
      </div>
    </div>
  `;

  // Theme row clicks (explicit theme choice turns off "system" mode)
  mount.querySelectorAll("[data-theme-key]").forEach(el => {
    el.addEventListener("click", () => {
      setTheme(el.getAttribute("data-theme-key"));
      renderHeader(pageTitle, breadcrumbTrail);
    });
  });
  const sysToggle = document.getElementById("systemThemeToggle");
  if (sysToggle) sysToggle.addEventListener("click", () => {
    setThemeMode(isSystemMode ? "manual" : "system");
    renderHeader(pageTitle, breadcrumbTrail);
  });

  // Role switch clicks
  mount.querySelectorAll("[data-role]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      setCurrentRole(el.getAttribute("data-role"));
      location.reload();
    });
  });

  // Header search + mobile search button both open the command palette
  const searchInput = document.getElementById("globalSearchInput");
  if (searchInput) searchInput.addEventListener("focus", () => { searchInput.blur(); openCommandPalette(); });
  const mobileSearchBtn = document.getElementById("mobileSearchBtn");
  if (mobileSearchBtn) mobileSearchBtn.addEventListener("click", () => openCommandPalette());
}

/* ---------------------------------------------------------------------- */
/* COMMAND PALETTE  (Ctrl/Cmd + K)                                          */
/* ---------------------------------------------------------------------- */

const CMDK_PAGES = [
  { title: "Dashboard", href: "dashboard.html", icon: "bi-grid-1x2" },
  { title: "Employees", href: "employees.html", icon: "bi-people" },
  { title: "Departments", href: "departments.html", icon: "bi-diagram-3" },
  { title: "Attendance", href: "attendance.html", icon: "bi-fingerprint" },
  { title: "Leave", href: "leave.html", icon: "bi-calendar2-week" },
  { title: "Payroll", href: "payroll.html", icon: "bi-cash-stack" },
  { title: "Recruitment", href: "recruitment.html", icon: "bi-briefcase" },
  { title: "Onboarding", href: "onboarding.html", icon: "bi-person-plus" },
  { title: "Performance", href: "performance.html", icon: "bi-graph-up-arrow" },
  { title: "Expenses", href: "expenses.html", icon: "bi-wallet2" },
  { title: "Assets", href: "asset-management.html", icon: "bi-laptop" },
  { title: "Documents", href: "documents.html", icon: "bi-folder2-open" },
  { title: "Announcements", href: "announcements.html", icon: "bi-megaphone" },
  { title: "Tasks & Timesheet", href: "productivity.html", icon: "bi-list-check" },
  { title: "Reports", href: "reports.html", icon: "bi-bar-chart" },
  { title: "Settings", href: "settings.html", icon: "bi-gear" }
];

const CMDK_ACTIONS = [
  { title: "Apply for Leave", href: "leave.html", icon: "bi-calendar-plus", perm: "apply_leave" },
  { title: "Submit Expense Claim", href: "expenses.html", icon: "bi-receipt", perm: "submit_expense" },
  { title: "Add Employee", href: "employees.html", icon: "bi-person-plus", perm: "manage_employees" },
  { title: "Post a Job Opening", href: "recruitment.html", icon: "bi-briefcase", perm: "manage_recruitment" },
  { title: "Process Payroll", href: "payroll.html", icon: "bi-play-circle", perm: "process_payroll" },
  { title: "New Announcement", href: "announcements.html", icon: "bi-megaphone", perm: "manage_announcements" },
  { title: "View My Payslip", href: "payslip.html", icon: "bi-file-earmark-text" },
];

function renderCommandPalette() {
  if (document.getElementById("cmdkBackdrop")) return;
  const el = document.createElement("div");
  el.className = "cmdk-backdrop";
  el.id = "cmdkBackdrop";
  el.innerHTML = `
    <div class="cmdk-box" role="dialog" aria-modal="true" aria-label="Command palette">
      <div class="cmdk-input-row">
        <i class="bi bi-search"></i>
        <input type="text" id="cmdkInput" placeholder="Search employees, pages, actions…" autocomplete="off">
        <span class="cmdk-esc">ESC</span>
      </div>
      <div class="cmdk-results" id="cmdkResults"></div>
    </div>`;
  document.body.appendChild(el);

  el.addEventListener("click", (e) => { if (e.target === el) closeCommandPalette(); });
  const input = document.getElementById("cmdkInput");
  input.addEventListener("input", () => renderCmdkResults(input.value.trim().toLowerCase()));
  input.addEventListener("keydown", (e) => {
    const items = Array.from(document.querySelectorAll("#cmdkResults .cmdk-item"));
    if (!items.length) return;
    let idx = items.findIndex(it => it.classList.contains("kbd-active"));
    if (e.key === "ArrowDown") { e.preventDefault(); idx = (idx + 1) % items.length; }
    else if (e.key === "ArrowUp") { e.preventDefault(); idx = (idx - 1 + items.length) % items.length; }
    else if (e.key === "Enter") { e.preventDefault(); if (items[idx]) items[idx].click(); return; }
    else return;
    items.forEach(it => it.classList.remove("kbd-active"));
    items[idx].classList.add("kbd-active");
    items[idx].scrollIntoView({ block: "nearest" });
  });
}

function renderCmdkResults(q) {
  const mount = document.getElementById("cmdkResults");
  const user = getCurrentUser();
  let html = "";

  const actions = CMDK_ACTIONS.filter(a => !a.perm || hasPermission(a.perm))
    .filter(a => !q || a.title.toLowerCase().includes(q));
  const pages = CMDK_PAGES.filter(p => !q || p.title.toLowerCase().includes(q));
  const empMatches = q ? employees.filter(e => e.name.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q)).slice(0, 5) : [];

  if (q && empMatches.length) {
    html += `<div class="cmdk-group-label">Employees</div>`;
    html += empMatches.map(e => `<div class="cmdk-item" data-href="employee-profile.html?id=${e.id}"><div class="cmdk-ic"><img src="${e.avatar}" alt="${e.name}" style="width:100%;height:100%;border-radius:inherit;object-fit:cover;"></div><span>${e.name}</span><span class="cmdk-meta">${e.designation}</span></div>`).join("");
  }
  if (actions.length) {
    html += `<div class="cmdk-group-label">Quick Actions</div>`;
    html += actions.map(a => `<div class="cmdk-item" data-href="${a.href}"><div class="cmdk-ic"><i class="bi ${a.icon}"></i></div><span>${a.title}</span></div>`).join("");
  }
  if (pages.length) {
    html += `<div class="cmdk-group-label">Go to page</div>`;
    html += pages.map(p => `<div class="cmdk-item" data-href="${p.href}"><div class="cmdk-ic"><i class="bi ${p.icon}"></i></div><span>${p.title}</span></div>`).join("");
  }
  if (!html) html = `<div class="cmdk-empty"><i class="bi bi-search mb-2 d-block" style="font-size:1.5rem;"></i>No results for "${q}"</div>`;

  mount.innerHTML = html;
  mount.querySelectorAll(".cmdk-item").forEach((it, i) => {
    if (i === 0) it.classList.add("kbd-active");
    it.addEventListener("click", () => { window.location.href = it.dataset.href; });
  });
}

function openCommandPalette() {
  renderCommandPalette();
  const backdrop = document.getElementById("cmdkBackdrop");
  const input = document.getElementById("cmdkInput");
  backdrop.classList.add("show");
  input.value = "";
  renderCmdkResults("");
  setTimeout(() => input.focus(), 30);
}

function closeCommandPalette() {
  const backdrop = document.getElementById("cmdkBackdrop");
  if (backdrop) backdrop.classList.remove("show");
}

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openCommandPalette();
  } else if (e.key === "Escape") {
    closeCommandPalette();
  }
});

/* ---------------------------------------------------------------------- */
/* PAGE HEADER (title / description / primary actions)                     */
/* ---------------------------------------------------------------------- */

function renderPageHeader(mountId, title, desc, actionsHtml) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  mount.innerHTML = `
    <div>
      <h1 class="page-title">${title}</h1>
      ${desc ? `<p class="page-desc">${desc}</p>` : ""}
    </div>
    ${actionsHtml ? `<div class="d-flex gap-2 flex-wrap no-print">${actionsHtml}</div>` : ""}
  `;
}

/* ---------------------------------------------------------------------- */
/* SMALL REUSABLE RENDER HELPERS                                            */
/* ---------------------------------------------------------------------- */

function badgeStatus(status) {
  return `<span class="badge-status st-${statusSlug(status)}">${status}</span>`;
}

function priorityPill(p) {
  return `<span class="priority-pill priority-${statusSlug(p)}">${p}</span>`;
}

function avatarNameCell(avatar, name, meta) {
  return `<div class="cell-name-wrap"><img src="${avatar}" class="avatar-sm" alt="${name}"><div class="cell-name-meta"><div class="n">${name}</div>${meta ? `<div class="m">${meta}</div>` : ""}</div></div>`;
}

function emptyState(icon, title, desc, actionHtml) {
  return `<div class="empty-state"><i class="bi ${icon}"></i><h6>${title}</h6><p style="font-size:.85rem;">${desc}</p>${actionHtml || ""}</div>`;
}

function starRating(n) {
  let out = "";
  for (let i = 1; i <= 5; i++) out += `<i class="bi ${i <= n ? "bi-star-fill" : "bi-star"}" style="color:${i <= n ? "var(--accent)" : "var(--border-strong)"};font-size:.8rem;"></i>`;
  return out;
}

/* Lightweight inline SVG sparkline — no Chart.js overhead for small trend lines. */
function sparklineSvg(data, color, opts) {
  opts = opts || {};
  const w = opts.width || 96, h = opts.height || 32, pad = 3;
  const max = Math.max(...data), min = Math.min(...data);
  const range = (max - min) || 1;
  const stepX = (w - pad * 2) / (data.length - 1 || 1);
  const pts = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (h - pad * 2) * (1 - (v - min) / range);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const fillPts = `${pad},${h - pad} ${pts.join(" ")} ${w - pad},${h - pad}`;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" style="display:block;">
    <polyline points="${fillPts}" fill="${color}" opacity=".12" stroke="none"></polyline>
    <polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
  </svg>`;
}

/* KPI card component — one function, several variants, used across every dashboard/module page.
   opts:
     label, value, icon, tint, aos            — always
     trend, trendUp, trendLabel  OR  sub       — standard comparison line (back-compat with original calls)
     variant: "sparkline" | "progress" | "target" | "status" | undefined (standard)
     sparklineData: number[]                   — for variant "sparkline"
     progress: 0-100, progressLabel            — for variant "progress" / "target"
     target: string                            — extra target value shown for variant "target"
     status / statusTint                       — for variant "status" */
function kpiCard(opts) {
  const tint = opts.tint || "brand";
  const trendHtml = opts.trend
    ? `<span class="kpi-trend ${opts.trendUp === false ? "down" : "up"}"><i class="bi ${opts.trendUp === false ? "bi-arrow-down-right" : "bi-arrow-up-right"}"></i>${opts.trend}</span>`
    : "";
  const subHtml = !opts.trend && opts.sub ? `<span class="kpi-trend-cmp">${opts.sub}</span>` : "";
  const trendLabelHtml = opts.trend && opts.trendLabel ? `<span class="kpi-trend-cmp">${opts.trendLabel}</span>` : "";

  let extra = "";
  if (opts.variant === "sparkline" && opts.sparklineData) {
    const color = themeColor(`--${tint === "brand" ? "brand" : tint}`) || themeColor("--brand");
    extra = `<div class="kpi-spark">${sparklineSvg(opts.sparklineData, color)}</div>`;
  } else if (opts.variant === "progress" || opts.variant === "target") {
    extra = `<div class="kpi-progress-row">
      <div class="progress" style="height:6px;"><div class="progress-bar bg-${tint === "brand" ? "brand" : tint}" style="width:${opts.progress || 0}%;background:var(--${tint === "brand" ? "brand" : tint});"></div></div>
      <div class="d-flex justify-content-between mt-1"><span class="kpi-progress-label">${opts.progressLabel || (opts.progress + "% complete")}</span>${opts.target ? `<span class="kpi-progress-label">${opts.target}</span>` : ""}</div>
    </div>`;
  } else if (opts.variant === "status" && opts.status) {
    extra = `<div class="mt-1">${badgeStatus(opts.status)}</div>`;
  }

  return `
  <div class="hrm-card kpi-card" ${opts.aos ? `data-aos="fade-up"` : ""}>
    <div class="kpi-icon bg-tint-${tint}"><i class="bi ${opts.icon}"></i></div>
    <span class="kpi-label">${opts.label}</span>
    <div class="kpi-bottom-row">
      <span class="kpi-value num">${opts.value}</span>
      <div class="d-flex align-items-center gap-2 flex-wrap">${trendHtml}${trendLabelHtml}${subHtml}</div>
    </div>
    ${extra}
  </div>`;
}

/* Radial / arc gauge component (used for "Monthly Target"-style visuals). SVG-based
   so it stays crisp, theme-aware (currentColor) and needs no charting library. */
function gaugeArc(opts) {
  opts = opts || {};
  const pct = Math.max(0, Math.min(100, opts.value || 0));
  const size = opts.size || 220;
  const stroke = opts.strokeWidth || 16;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  // semi-circle from 180deg to 0deg (bottom half hidden), sweep-based
  const startAngle = 180, endAngle = 0;
  const angle = startAngle - (pct / 100) * (startAngle - endAngle);
  const toXY = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)];
  };
  const [sx, sy] = toXY(startAngle);
  const [ex, ey] = toXY(angle);
  const largeArc = (startAngle - angle) > 180 ? 1 : 0;
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
  const valuePath = pct > 0 ? `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}` : "";
  const color = opts.color || "var(--brand)";
  return `
  <svg viewBox="0 0 ${size} ${size * 0.62}" width="100%" style="max-width:${size}px;display:block;margin:0 auto;">
    <path d="${trackPath}" fill="none" stroke="var(--surface-2)" stroke-width="${stroke}" stroke-linecap="round"></path>
    ${valuePath ? `<path d="${valuePath}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"></path>` : ""}
  </svg>`;
}

/* Reads live CSS variable values so Chart.js palettes follow the active theme. */
function themeColor(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
function chartPalette() {
  return {
    brand: themeColor("--brand"), success: themeColor("--success"), warning: themeColor("--warning"),
    danger: themeColor("--danger"), info: themeColor("--info"), accent: themeColor("--accent"),
    text: themeColor("--text-secondary"), grid: themeColor("--border-color")
  };
}

/* Generic pagination renderer.
   onPage: function(pageNumber) called when a page is clicked. */
function renderPagination(mountId, totalItems, perPage, currentPage, onPage) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  currentPage = Math.min(Math.max(1, currentPage), totalPages);
  const from = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalItems);

  let pagesHtml = "";
  const windowSize = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= windowSize) {
      pagesHtml += `<li class="page-item ${p === currentPage ? "active" : ""}"><button class="page-link" data-p="${p}">${p}</button></li>`;
    } else if (Math.abs(p - currentPage) === windowSize + 1) {
      pagesHtml += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
    }
  }

  mount.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3">
      <div style="font-size:.8rem;color:var(--text-muted);">Showing ${from}–${to} of ${totalItems}</div>
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}"><button class="page-link" data-p="${currentPage - 1}"><i class="bi bi-chevron-left"></i></button></li>
        ${pagesHtml}
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}"><button class="page-link" data-p="${currentPage + 1}"><i class="bi bi-chevron-right"></i></button></li>
      </ul>
    </div>`;

  mount.querySelectorAll("[data-p]").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = parseInt(btn.getAttribute("data-p"), 10);
      if (p >= 1 && p <= totalPages) onPage(p);
    });
  });
}

function paginate(array, page, perPage) {
  const start = (page - 1) * perPage;
  return array.slice(start, start + perPage);
}

/* Confirmation modal (single shared instance, id=confirmModal, injected once per page) */
function ensureConfirmModal() {
  if (document.getElementById("confirmModal")) return;
  const div = document.createElement("div");
  div.innerHTML = `
  <div class="modal fade" id="confirmModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered" style="max-width:400px;">
      <div class="modal-content">
        <div class="modal-body text-center pt-4 pb-2">
          <div class="mb-3"><i class="bi bi-exclamation-triangle" style="font-size:2.2rem;color:var(--danger);"></i></div>
          <h5 id="confirmModalTitle">Are you sure?</h5>
          <p class="text-muted-2 mb-0" id="confirmModalBody" style="font-size:.85rem;">This action cannot be undone.</p>
        </div>
        <div class="modal-footer border-0 justify-content-center pb-4">
          <button type="button" class="btn btn-light-2" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="confirmModalYes">Confirm</button>
        </div>
      </div>
    </div>
  </div>`;
  document.body.appendChild(div.firstElementChild);
}

function confirmAction(title, body, onConfirm) {
  ensureConfirmModal();
  document.getElementById("confirmModalTitle").textContent = title;
  document.getElementById("confirmModalBody").textContent = body;
  const modalEl = document.getElementById("confirmModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const yesBtn = document.getElementById("confirmModalYes");
  const newYes = yesBtn.cloneNode(true);
  yesBtn.parentNode.replaceChild(newYes, yesBtn);
  newYes.addEventListener("click", () => { modal.hide(); onConfirm(); });
  modal.show();
}

/* ============================================================
   SHARED CROSS-PAGE HELPERS
   (used by employee-profile.js, attendance.js, documents.js, etc.)
   ============================================================ */
function infoItem(label, value) {
  return `<div class="col-md-6"><div style="font-size:.74rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.03em;">${label}</div><div style="font-size:.9rem;font-weight:600;">${value || "—"}</div></div>`;
}
function payLine(label, amt) {
  return `<div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">${label}</span><span class="num">${formatINR(amt)}</span></div>`;
}
function cardWrap(title, body) {
  return `<div class="hrm-card"><div class="hrm-card-head">${title}</div><div class="hrm-card-body">${body}</div></div>`;
}
function docCardHtml(d) {
  return `<div class="col-md-6"><div class="doc-card"><div class="doc-ic bg-tint-brand"><i class="bi bi-file-earmark-text"></i></div>
    <div><div style="font-size:.85rem;font-weight:600;">${d.name}</div><div style="font-size:.74rem;color:var(--text-muted);">${d.category} · ${formatDateReadable(d.uploadedDate)}</div>${badgeStatus(d.status)}</div></div></div>`;
}
function funnelRow() {
  const colors = ["brand", "info", "warning", "accent", "success", "success"];
  return `<div class="d-flex align-items-center flex-wrap">${funnelData.map((f, i) => `
    <div class="funnel-stage bg-tint-${colors[i]}" style="flex:1;min-width:90px;">
      <div class="funnel-num">${f.value}</div><div class="funnel-label">${f.label}</div>
    </div>${i < funnelData.length - 1 ? `<div class="funnel-arrow px-1"><i class="bi bi-chevron-right"></i></div>` : ""}`).join("")}</div>`;
}
function monthCalendarHtml(cal) {
  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const tagMap = { P: ["Present", "success"], A: ["Absent", "danger"], L: ["Leave", "warning"], H: ["Holiday", "brand"], WFH: ["WFH", "info"], WE: ["Weekend", "muted"] };
  let cells = "";
  for (let i = 0; i < cal[0].dow; i++) cells += `<div class="mini-cal-day blank"></div>`;
  cal.forEach(c => {
    const tag = tagMap[c.status];
    const isToday = c.day === 19;
    cells += `<div class="mini-cal-day ${isToday ? "today" : ""}"><span class="dnum">${c.day}</span>${tag && tag[1] !== "muted" ? `<span class="tag bg-tint-${tag[1]}">${tag[0]}</span>` : ""}</div>`;
  });
  return `<div class="mini-cal"><div class="mini-cal-grid">${dows.map(d => `<div class="dow">${d}</div>`).join("")}</div><div class="mini-cal-grid">${cells}</div></div>
  <div class="d-flex gap-3 flex-wrap mt-3" style="font-size:.76rem;">
    <span><span class="badge-status st-present">Present</span></span><span><span class="badge-status st-absent">Absent</span></span>
    <span><span class="badge-status st-onleave">Leave</span></span><span><span class="badge-status st-holiday">Holiday</span></span>
    <span><span class="badge-status st-late">WFH</span></span>
  </div>`;
}
