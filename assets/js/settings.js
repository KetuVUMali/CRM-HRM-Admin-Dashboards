/* ==========================================================================
   SETTINGS.JS
   ========================================================================== */

let editUserIdx = null;

document.addEventListener("DOMContentLoaded", () => {
  renderPageHeader("pageHeaderMount", "Settings", "Configure company details, user access and system preferences.", "");

  document.getElementById("euRole").innerHTML = roles.map(r => `<option value="${r}">${roleLabels[r]}</option>`).join("");

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderSettingsTab(btn.dataset.tab);
  }));

  document.getElementById("saveUserBtn").addEventListener("click", () => {
    const u = systemUsers[editUserIdx];
    u.role = document.getElementById("euRole").value;
    u.status = document.getElementById("euStatus").value;
    showToast(`Access updated for ${u.name}.`, "success");
    bootstrap.Modal.getInstance(document.getElementById("editUserModal")).hide();
    renderSettingsTab("users");
  });

  renderSettingsTab("general");
});

function restrictedPanel(msg) {
  return `<div class="hrm-card"><div class="hrm-card-body">${emptyState("bi-shield-lock", "Restricted Access", msg || "You don't have permission to view this section. Contact your Super Admin for access.")}</div></div>`;
}

function renderSettingsTab(tab) {
  const mount = document.getElementById("settingsTabContent");
  if (tab === "general") mount.innerHTML = generalTabHtml();
  else if (tab === "appearance") { mount.innerHTML = appearanceTabHtml(); wireAppearanceTab(); }
  else if (tab === "users") { mount.innerHTML = usersTabHtml(); wireUsersTab(); }
  else if (tab === "permissions") { mount.innerHTML = permissionsTabHtml(); wirePermissionsTab(); }
  else if (tab === "audit") mount.innerHTML = auditTabHtml();
  else if (tab === "notifications") mount.innerHTML = notificationsTabHtml();
}

/* ---------------------------------------------------------------------- */
/* APPEARANCE                                                               */
/* ---------------------------------------------------------------------- */

function appearanceTabHtml() {
  const isSystemMode = (localStorage.getItem("hrmThemeMode") || "manual") === "system";
  const effectiveTheme = getEffectiveTheme();
  const density = localStorage.getItem("hrmDensity") || "comfortable";

  const themeCards = THEME_LIST.map(t => `
    <div class="col-6 col-lg-4">
      <button type="button" class="theme-preview-card ${!isSystemMode && effectiveTheme === t.key ? "active" : ""}" data-theme-key="${t.key}">
        <div class="theme-preview-swatches">
          <span style="background:${t.swatch}"></span>
          <span style="background:${t.scheme === "dark" ? "#0b0e14" : "#ffffff"};border:1px solid var(--border-color);"></span>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <span style="font-size:.85rem;font-weight:600;">${t.name}</span>
          ${!isSystemMode && effectiveTheme === t.key ? '<i class="bi bi-check-circle-fill" style="color:var(--brand);"></i>' : ""}
        </div>
        <div style="font-size:.72rem;color:var(--text-muted);text-transform:capitalize;">${t.scheme} mode</div>
      </button>
    </div>`).join("");

  return `
  <div class="hrm-card mb-3">
    <div class="hrm-card-head">Theme</div>
    <div class="hrm-card-body">
      <div class="d-flex justify-content-between align-items-center mb-3 p-3" style="background:var(--surface-2);border-radius:var(--radius-sm);">
        <div>
          <div style="font-weight:600;font-size:.88rem;">Match system appearance</div>
          <div style="font-size:.76rem;color:var(--text-muted);">Automatically switch between your last light theme and Dark SaaS based on your device's setting.</div>
        </div>
        <div class="form-check form-switch flex-shrink-0 ms-3">
          <input class="form-check-input" type="checkbox" role="switch" id="apSystemSwitch" ${isSystemMode ? "checked" : ""} style="width:2.5em;height:1.4em;">
        </div>
      </div>
      <div class="row g-3">${themeCards}</div>
    </div>
  </div>

  <div class="hrm-card">
    <div class="hrm-card-head">Density</div>
    <div class="hrm-card-body">
      <p style="font-size:.84rem;color:var(--text-muted);">Controls the padding used in tables and lists across the app.</p>
      <div class="btn-group" role="group">
        <input type="radio" class="btn-check" name="density" id="denComfortable" ${density === "comfortable" ? "checked" : ""}>
        <label class="btn btn-light-2" for="denComfortable">Comfortable</label>
        <input type="radio" class="btn-check" name="density" id="denCompact" ${density === "compact" ? "checked" : ""}>
        <label class="btn btn-light-2" for="denCompact">Compact</label>
        <input type="radio" class="btn-check" name="density" id="denSpacious" ${density === "spacious" ? "checked" : ""}>
        <label class="btn btn-light-2" for="denSpacious">Spacious</label>
      </div>
    </div>
  </div>`;
}

function wireAppearanceTab() {
  document.getElementById("apSystemSwitch").addEventListener("change", (e) => {
    setThemeMode(e.target.checked ? "system" : "manual");
    renderSettingsTab("appearance");
    if (typeof renderHeader === "function") location.reload();
  });
  document.querySelectorAll("[data-theme-key]").forEach(btn => btn.addEventListener("click", () => {
    setTheme(btn.dataset.themeKey);
    renderSettingsTab("appearance");
    showToast(`Theme switched to ${THEME_LIST.find(t => t.key === btn.dataset.themeKey).name}.`, "success");
  }));
  ["denComfortable", "denCompact", "denSpacious"].forEach(id => {
    document.getElementById(id).addEventListener("change", (e) => {
      if (!e.target.checked) return;
      const map = { denComfortable: "comfortable", denCompact: "compact", denSpacious: "spacious" };
      localStorage.setItem("hrmDensity", map[id]);
      document.documentElement.setAttribute("data-density", map[id]);
      showToast("Density preference saved.", "success");
    });
  });
}

/* ---------------------------------------------------------------------- */
/* GENERAL / COMPANY SETTINGS                                               */
/* ---------------------------------------------------------------------- */

function generalTabHtml() {
  const canEdit = hasPermission("manage_settings");
  return `
  <div class="hrm-card">
    <div class="hrm-card-head">Company Settings</div>
    <div class="hrm-card-body">
      <fieldset ${canEdit ? "" : "disabled"}>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label">Company Name</label><input class="form-control" value="NimbusHR Technologies Pvt. Ltd."></div>
          <div class="col-md-6"><label class="form-label">Registered Address</label><input class="form-control" value="Prestige Tech Park, Bengaluru, Karnataka 560103"></div>
          <div class="col-md-4"><label class="form-label">Time Zone</label><select class="form-select"><option selected>(GMT+5:30) India Standard Time</option></select></div>
          <div class="col-md-4"><label class="form-label">Default Currency</label><select class="form-select"><option selected>INR (₹)</option><option>USD ($)</option></select></div>
          <div class="col-md-4"><label class="form-label">Fiscal Year Start</label><select class="form-select"><option selected>April</option><option>January</option></select></div>
          <div class="col-md-6"><label class="form-label">Working Days</label><input class="form-control" value="Monday – Friday"></div>
          <div class="col-md-6"><label class="form-label">Standard Working Hours</label><input class="form-control" value="09:30 AM – 06:30 PM"></div>
        </div>
        <button class="btn btn-primary mt-4" onclick="showToast('Company settings saved.','success')"><i class="bi bi-check-lg me-1"></i>Save Changes</button>
      </fieldset>
      ${!canEdit ? `<div class="mt-3"><span class="text-muted-2" style="font-size:.8rem;"><i class="bi bi-lock me-1"></i>You have view-only access to company settings.</span></div>` : ""}
    </div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* USERS & ROLES                                                            */
/* ---------------------------------------------------------------------- */

function usersTabHtml() {
  const canManage = hasPermission("manage_users");
  return `<div class="hrm-card">
    <div class="hrm-card-head d-flex justify-content-between align-items-center">
      <span>System Users</span>
      ${canManage ? `<button class="btn btn-sm btn-primary" onclick="showToast('Invite user form will be connected to backend later.','info')"><i class="bi bi-plus-lg me-1"></i>Invite User</button>` : ""}
    </div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Name</th><th>Role</th><th>Employee ID</th><th>Email</th><th>Last Login</th><th>Status</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead>
      <tbody id="usersTbody">${systemUsers.map((u, i) => `<tr>
        <td class="cell-primary">${u.name}</td><td>${roleLabels[u.role]}</td><td>${u.employeeId}</td><td>${u.email}</td><td>${u.lastLogin}</td><td>${badgeStatus(u.status)}</td>
        ${canManage ? `<td><button class="btn btn-sm btn-light-2" data-edituser="${i}"><i class="bi bi-pencil"></i></button></td>` : ""}
      </tr>`).join("")}</tbody>
    </table></div>
    ${!canManage ? `<div class="hrm-card-body pt-0"><span class="text-muted-2" style="font-size:.8rem;"><i class="bi bi-lock me-1"></i>Only Super Admins can modify user roles and access.</span></div>` : ""}
  </div>`;
}

function wireUsersTab() {
  document.querySelectorAll("[data-edituser]").forEach(btn => btn.addEventListener("click", () => {
    editUserIdx = btn.dataset.edituser;
    const u = systemUsers[editUserIdx];
    document.getElementById("euName").value = u.name;
    document.getElementById("euRole").value = u.role;
    document.getElementById("euStatus").value = u.status;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("editUserModal")).show();
  }));
}

/* ---------------------------------------------------------------------- */
/* PERMISSIONS MATRIX                                                       */
/* ---------------------------------------------------------------------- */

function permissionsTabHtml() {
  const canEdit = hasPermission("manage_permissions");
  return `
  <div class="hrm-card">
    <div class="hrm-card-head d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span>Permission Matrix</span>
      <select class="form-select form-select-sm" style="width:auto;" id="permRoleSelect">${roles.map(r => `<option value="${r}">${roleLabels[r]}</option>`).join("")}</select>
    </div>
    <div class="table-wrap"><table class="hrm-table perm-matrix" id="permMatrixTable"></table></div>
    ${!canEdit ? `<div class="hrm-card-body pt-0"><span class="text-muted-2" style="font-size:.8rem;"><i class="bi bi-lock me-1"></i>View-only. Only Super Admins can modify permissions.</span></div>` : ""}
  </div>`;
}

function wirePermissionsTab() {
  const select = document.getElementById("permRoleSelect");
  select.value = getCurrentUser().role;
  select.addEventListener("change", (e) => renderPermMatrix(e.target.value));
  renderPermMatrix(select.value);
}

function renderPermMatrix(role) {
  const table = document.getElementById("permMatrixTable");
  if (!table) return;
  const matrix = buildPermissionMatrix(role);
  const yes = `<i class="bi bi-check-circle-fill" style="color:var(--success);"></i>`;
  const no = `<i class="bi bi-dash-circle" style="color:var(--border-strong);"></i>`;
  table.innerHTML = `<thead><tr><th>Module</th><th>View</th><th>Create</th><th>Edit</th><th>Delete</th><th>Approve</th></tr></thead>
    <tbody>${matrix.map(m => `<tr><td class="cell-primary">${m.module}</td><td>${m.view ? yes : no}</td><td>${m.create ? yes : no}</td><td>${m.edit ? yes : no}</td><td>${m.del ? yes : no}</td><td>${m.approve ? yes : no}</td></tr>`).join("")}</tbody>`;
}

/* ---------------------------------------------------------------------- */
/* AUDIT LOG                                                                */
/* ---------------------------------------------------------------------- */

function auditTabHtml() {
  if (!hasPermission("view_audit_log")) return restrictedPanel("Audit logs are only visible to Super Admins.");
  return `<div class="hrm-card">
    <div class="hrm-card-head">System Audit Log</div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>User</th><th>Action</th><th>Module</th><th>Description</th><th>IP Address</th><th>Date &amp; Time</th><th>Status</th></tr></thead>
      <tbody>${auditLogs.map(a => `<tr>
        <td class="cell-primary">${a.user}</td><td>${a.action}</td><td>${a.module}</td><td style="max-width:260px;">${a.description}</td>
        <td class="num" style="font-size:.78rem;">${a.ip}</td><td style="font-size:.78rem;">${formatDateReadable(a.date)} · ${a.time}</td><td>${badgeStatus(a.status)}</td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* NOTIFICATION SETTINGS                                                    */
/* ---------------------------------------------------------------------- */

function notificationsTabHtml() {
  const items = [
    ["Email Notifications", "Receive email updates for leave approvals, payroll and announcements.", true],
    ["Push Notifications", "Get real-time alerts inside the app for important actions.", true],
    ["Leave Request Alerts", "Notify managers when a team member applies for leave.", true],
    ["Payroll Processing Alerts", "Notify payroll team when a cycle is ready for review.", true],
    ["Weekly Digest", "A weekly summary of attendance, leave and tasks.", false]
  ];
  return `<div class="hrm-card">
    <div class="hrm-card-head">Notification Preferences</div>
    <div class="hrm-card-body">
      ${items.map((it, i) => `
        <div class="d-flex justify-content-between align-items-center py-2" style="border-bottom:1px solid var(--border-color);">
          <div><div style="font-weight:600;font-size:.86rem;">${it[0]}</div><div style="font-size:.76rem;color:var(--text-muted);">${it[1]}</div></div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="ntf${i}" ${it[2] ? "checked" : ""} onchange="showToast('Notification preference updated.','success')">
          </div>
        </div>`).join("")}
    </div>
  </div>`;
}
