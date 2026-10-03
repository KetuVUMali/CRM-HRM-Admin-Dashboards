/* ==========================================================================
   LEAVE.JS
   ========================================================================== */

let lrCounter = 2208;
const leaveState = { reqSearch: "", reqStatus: "", reqPage: 1, reqPerPage: 6 };

document.addEventListener("DOMContentLoaded", () => {
  const canManage = hasPermission("manage_leave") || hasPermission("approve_team_leave");
  renderPageHeader("pageHeaderMount", "Leave Management", "Apply for leave, track balances and manage your team's time off.",
    `<button class="btn btn-primary" id="goApplyBtn"><i class="bi bi-plus-lg me-1"></i>Apply Leave</button>`);

  document.getElementById("goApplyBtn").addEventListener("click", () => activateTab("apply"));

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => activateTab(btn.dataset.tab)));

  renderLeaveTab("dashboard");
});

function activateTab(tab) {
  document.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  renderLeaveTab(tab);
}

function renderLeaveTab(tab) {
  const mount = document.getElementById("leaveTabContent");
  if (tab === "dashboard") mount.innerHTML = leaveDashboardHtml();
  else if (tab === "apply") { mount.innerHTML = applyLeaveHtml(); wireApplyLeave(); }
  else if (tab === "requests") { mount.innerHTML = ""; renderLeaveRequestsTab(); }
  else if (tab === "types") mount.innerHTML = leaveTypesHtml();
  else if (tab === "holidays") mount.innerHTML = holidaysHtml();
}

/* ---------------------------------------------------------------------- */
/* DASHBOARD                                                                */
/* ---------------------------------------------------------------------- */

function leaveDashboardHtml() {
  const pending = leaveRequests.filter(r => r.status === "Pending").length;
  const approved = leaveRequests.filter(r => r.status === "Approved").length;
  const rejected = leaveRequests.filter(r => r.status === "Rejected").length;
  const totalDays = leaveBalance.annual.total + leaveBalance.casual.total + leaveBalance.sick.total + leaveBalance.earned.total;

  return `
  <div class="row g-3 mb-4">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Leave (Annual)", value: totalDays, icon: "bi-calendar2-range", tint: "brand", sub: "days per employee" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Pending Requests", value: pending, icon: "bi-hourglass-split", tint: "warning", sub: "awaiting action" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Approved", value: approved, icon: "bi-check-circle", tint: "success", sub: "this cycle" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Rejected", value: rejected, icon: "bi-x-circle", tint: "danger", sub: "this cycle" })}</div>
  </div>
  <div class="row g-3">
    <div class="col-md-6 col-xl-3">${leaveBalanceCard("Annual Leave", "bi-calendar2-range", leaveBalance.annual, "brand")}</div>
    <div class="col-md-6 col-xl-3">${leaveBalanceCard("Casual Leave", "bi-cup-hot", leaveBalance.casual, "info")}</div>
    <div class="col-md-6 col-xl-3">${leaveBalanceCard("Sick Leave", "bi-heart-pulse", leaveBalance.sick, "danger")}</div>
    <div class="col-md-6 col-xl-3">${leaveBalanceCard("Earned Leave", "bi-piggy-bank", leaveBalance.earned, "success")}</div>
  </div>
  <div class="row g-3 mt-1">
    <div class="col-lg-7">
      <div class="hrm-card">
        <div class="hrm-card-head">Recent Leave Requests</div>
        <div class="table-wrap"><table class="hrm-table">
          <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
          <tbody>${leaveRequests.slice(0, 5).map(r => `<tr>
            <td>${avatarNameCell(r.avatar, r.employee)}</td><td>${r.type}</td>
            <td>${formatDateReadable(r.from)} – ${formatDateReadable(r.to)}</td><td>${badgeStatus(r.status)}</td>
          </tr>`).join("")}</tbody>
        </table></div>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="hrm-card">
        <div class="hrm-card-head">Upcoming Holidays</div>
        <div class="hrm-card-body">
          <ul class="list-unstyled mb-0">
            ${holidays.filter(h => new Date(h.date) >= new Date("2026-09-19")).slice(0, 5).map(h => `
              <li class="d-flex justify-content-between align-items-center py-2" style="border-bottom:1px solid var(--border-color);">
                <div><div style="font-weight:600;font-size:.85rem;">${h.name}</div><div style="font-size:.74rem;color:var(--text-muted);">${h.type} · ${h.location}</div></div>
                <div class="text-end" style="font-size:.78rem;color:var(--text-muted);">${formatDateReadable(h.date)}</div>
              </li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  </div>`;
}

function leaveBalanceCard(label, icon, bal, tint) {
  const pct = Math.round((bal.used / bal.total) * 100) || 0;
  return `<div class="hrm-card" data-aos="fade-up">
    <div class="d-flex align-items-center gap-2 mb-2">
      <div class="kpi-icon bg-tint-${tint}"><i class="bi ${icon}"></i></div>
      <div style="font-weight:700;font-size:.9rem;">${label}</div>
    </div>
    <div class="d-flex justify-content-between align-items-baseline mb-1">
      <span class="num" style="font-size:1.4rem;font-weight:800;">${bal.remaining}</span>
      <span style="font-size:.76rem;color:var(--text-muted);">of ${bal.total} days left</span>
    </div>
    <div class="progress" style="height:6px;"><div class="progress-bar bg-${tint === "brand" ? "success" : tint}" style="width:${pct}%;"></div></div>
    <div style="font-size:.72rem;color:var(--text-muted);" class="mt-1">${bal.used} used this year</div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* APPLY LEAVE                                                              */
/* ---------------------------------------------------------------------- */

function applyLeaveHtml() {
  const user = getCurrentUser();
  return `
  <div class="row g-3">
    <div class="col-lg-8">
      <div class="hrm-card">
        <div class="hrm-card-head">Apply for Leave</div>
        <div class="hrm-card-body">
          <form id="applyLeaveForm" novalidate>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Leave Type</label>
                <select class="form-select" id="alType" required>${leaveTypes.map(t => `<option>${t.name}</option>`).join("")}</select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-control" id="alFrom" value="2026-09-22" required>
              </div>
              <div class="col-md-3">
                <label class="form-label">End Date</label>
                <input type="date" class="form-control" id="alTo" value="2026-09-23" required>
              </div>
              <div class="col-12">
                <label class="form-label">Reason</label>
                <textarea class="form-control" id="alReason" rows="3" placeholder="Briefly describe the reason for leave" required></textarea>
              </div>
              <div class="col-12">
                <label class="form-label">Attachment <span class="text-muted-2" style="font-weight:400;">(optional)</span></label>
                <input type="file" class="form-control" id="alFile">
              </div>
            </div>
            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary"><i class="bi bi-send me-1"></i>Submit Leave Request</button>
              <button type="reset" class="btn btn-light-2">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card mb-3">
        <div class="hrm-card-head">Your Leave Balance</div>
        <div class="hrm-card-body">
          ${leaveRow("Annual Leave", leaveBalance.annual, "brand")}
          ${leaveRow("Casual Leave", leaveBalance.casual, "info")}
          ${leaveRow("Sick Leave", leaveBalance.sick, "danger")}
          ${leaveRow("Earned Leave", leaveBalance.earned, "success")}
        </div>
      </div>
      <div class="hrm-card">
        <div class="hrm-card-head">Approval Flow</div>
        <div class="hrm-card-body">
          <ul class="timeline mb-0">
            <li><div class="t-title">${user.name} submits request</div><div class="t-meta">You</div></li>
            <li><div class="t-title">Reporting manager reviews</div><div class="t-meta">Pending</div></li>
            <li><div class="t-title">HR confirms &amp; updates balance</div><div class="t-meta">Pending</div></li>
          </ul>
        </div>
      </div>
    </div>
  </div>`;
}

function leaveRow(label, bal, tint) {
  const pct = Math.round((bal.used / bal.total) * 100) || 0;
  return `<div class="mb-3">
    <div class="d-flex justify-content-between mb-1" style="font-size:.82rem;"><span>${label}</span><span class="num" style="font-weight:700;">${bal.remaining}/${bal.total}</span></div>
    <div class="progress" style="height:6px;"><div class="progress-bar bg-${tint === "brand" ? "success" : tint}" style="width:${pct}%;"></div></div>
  </div>`;
}

function wireApplyLeave() {
  document.getElementById("applyLeaveForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const from = document.getElementById("alFrom").value;
    const to = document.getElementById("alTo").value;
    const days = Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000) + 1);
    const user = getCurrentUser();
    leaveRequests.unshift({
      id: `LR-${++lrCounter}`, employee: user.name, avatar: user.avatar,
      type: document.getElementById("alType").value, from, to, days,
      reason: document.getElementById("alReason").value, appliedOn: "2026-09-19", status: "Pending"
    });
    showToast("Leave request submitted successfully.", "success");
    form.reset();
    document.getElementById("alFrom").value = "2026-09-22";
    document.getElementById("alTo").value = "2026-09-23";
  });
}

/* ---------------------------------------------------------------------- */
/* LEAVE REQUESTS (HR / MANAGER VIEW)                                       */
/* ---------------------------------------------------------------------- */

function renderLeaveRequestsTab() {
  const mount = document.getElementById("leaveTabContent");
  const canAct = hasPermission("manage_leave") || hasPermission("approve_team_leave");
  mount.innerHTML = `
    <div class="filter-bar mb-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-4"><label class="form-label">Search</label><input class="form-control" id="lrSearch" placeholder="Search employee or reason..."></div>
        <div class="col-md-3"><label class="form-label">Status</label><select class="form-select" id="lrStatus"><option value="">All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
        <div class="col-md-2"><button class="btn btn-light-2 w-100" id="lrReset">Reset</button></div>
      </div>
    </div>
    <div class="hrm-card">
      <div class="table-wrap"><table class="hrm-table">
        <thead><tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied On</th><th>Status</th>${canAct ? "<th>Actions</th>" : ""}</tr></thead>
        <tbody id="lrTbody"></tbody>
      </table></div>
      <div id="lrPagination" class="px-3 pb-3"></div>
    </div>`;

  document.getElementById("lrSearch").addEventListener("input", debounce(e => { leaveState.reqSearch = e.target.value; leaveState.reqPage = 1; renderLeaveRequestsTable(); }, 250));
  document.getElementById("lrStatus").addEventListener("change", e => { leaveState.reqStatus = e.target.value; leaveState.reqPage = 1; renderLeaveRequestsTable(); });
  document.getElementById("lrReset").addEventListener("click", () => {
    leaveState.reqSearch = ""; leaveState.reqStatus = ""; leaveState.reqPage = 1;
    document.getElementById("lrSearch").value = ""; document.getElementById("lrStatus").value = "";
    renderLeaveRequestsTable();
  });
  renderLeaveRequestsTable();
}

function getFilteredLeaveRequests() {
  const s = leaveState.reqSearch.toLowerCase();
  return leaveRequests.filter(r =>
    (!s || r.employee.toLowerCase().includes(s) || r.reason.toLowerCase().includes(s)) &&
    (!leaveState.reqStatus || r.status === leaveState.reqStatus)
  );
}

function renderLeaveRequestsTable() {
  const canAct = hasPermission("manage_leave") || hasPermission("approve_team_leave");
  const tbody = document.getElementById("lrTbody");
  const filtered = getFilteredLeaveRequests();
  const pageRows = paginate(filtered, leaveState.reqPage, leaveState.reqPerPage);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="${canAct ? 9 : 8}">${emptyState("bi-calendar-x", "No Leave Requests Found", "There are no leave requests matching your search.")}</td></tr>`;
  } else {
    tbody.innerHTML = pageRows.map(r => `<tr>
      <td>${avatarNameCell(r.avatar, r.employee)}</td><td>${r.type}</td><td>${formatDateReadable(r.from)}</td><td>${formatDateReadable(r.to)}</td>
      <td>${r.days}</td><td style="max-width:220px;">${r.reason}</td><td>${formatDateReadable(r.appliedOn)}</td><td>${badgeStatus(r.status)}</td>
      ${canAct ? `<td>${r.status === "Pending" ? `
        <button class="btn btn-sm btn-outline-success me-1" data-approve="${r.id}"><i class="bi bi-check-lg"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-reject="${r.id}"><i class="bi bi-x-lg"></i></button>` : `<span class="text-muted-2" style="font-size:.78rem;">No action needed</span>`}</td>` : ""}
    </tr>`).join("");
  }

  renderPagination("lrPagination", filtered.length, leaveState.reqPerPage, leaveState.reqPage, (p) => { leaveState.reqPage = p; renderLeaveRequestsTable(); });

  tbody.querySelectorAll("[data-approve]").forEach(btn => btn.addEventListener("click", () => {
    const req = leaveRequests.find(r => r.id === btn.dataset.approve);
    confirmAction("Approve Leave Request?", `Approve ${req.type} for ${req.employee} (${req.days} day(s))?`, () => {
      req.status = "Approved";
      showToast("Leave request approved.", "success");
      renderLeaveRequestsTable();
    });
  }));
  tbody.querySelectorAll("[data-reject]").forEach(btn => btn.addEventListener("click", () => {
    const req = leaveRequests.find(r => r.id === btn.dataset.reject);
    confirmAction("Reject Leave Request?", `Reject ${req.type} for ${req.employee}? This cannot be undone.`, () => {
      req.status = "Rejected";
      showToast("Leave request rejected.", "danger");
      renderLeaveRequestsTable();
    });
  }));
}

/* ---------------------------------------------------------------------- */
/* LEAVE TYPES                                                              */
/* ---------------------------------------------------------------------- */

function leaveTypesHtml() {
  const canManage = hasPermission("manage_leave");
  return `<div class="hrm-card">
    <div class="hrm-card-head d-flex justify-content-between align-items-center">
      <span>Leave Types</span>
      ${canManage ? `<button class="btn btn-sm btn-primary" onclick="showToast('Add Leave Type form will be connected to backend later.','info')"><i class="bi bi-plus-lg me-1"></i>Add Leave Type</button>` : ""}
    </div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Name</th><th>Days / Year</th><th>Carry Forward</th><th>Paid / Unpaid</th><th>Approval Required</th><th>Status</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead>
      <tbody>${leaveTypes.map(t => `<tr>
        <td class="cell-primary">${t.name}</td><td>${t.daysPerYear || "—"}</td><td>${t.carryForward}</td><td>${t.paidUnpaid}</td><td>${t.approvalRequired}</td><td>${badgeStatus(t.status)}</td>
        ${canManage ? `<td><button class="btn btn-sm btn-light-2"><i class="bi bi-pencil"></i></button></td>` : ""}
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* HOLIDAY CALENDAR                                                         */
/* ---------------------------------------------------------------------- */

function holidaysHtml() {
  const canManage = hasPermission("manage_leave");
  return `<div class="hrm-card">
    <div class="hrm-card-head d-flex justify-content-between align-items-center">
      <span>Holiday Calendar — 2026</span>
      ${canManage ? `<button class="btn btn-sm btn-primary" onclick="showToast('Add Holiday form will be connected to backend later.','info')"><i class="bi bi-plus-lg me-1"></i>Add Holiday</button>` : ""}
    </div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Date</th><th>Day</th><th>Holiday</th><th>Type</th><th>Location</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead>
      <tbody>${holidays.map(h => `<tr>
        <td>${formatDateReadable(h.date)}</td><td>${h.day}</td><td class="cell-primary">${h.name}</td><td>${badgeStatus(h.type)}</td><td>${h.location}</td>
        ${canManage ? `<td><button class="btn btn-sm btn-light-2"><i class="bi bi-pencil"></i></button></td>` : ""}
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}
