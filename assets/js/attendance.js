/* ==========================================================================
   ATTENDANCE.JS
   ========================================================================== */

let attState = { search: "", dept: "", status: "", page: 1, perPage: 8 };
let calState = { year: 2026, month: 8 };
let checkState = { checkedIn: true };

document.addEventListener("DOMContentLoaded", () => {
  renderPageHeader("pageHeaderMount", "Attendance", "Track check-ins, shifts and overtime across the organization.",
    `<button class="btn btn-light-2" id="attExportBtn"><i class="bi bi-download me-1"></i>Export</button>`);

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderAttTab(btn.dataset.tab);
  }));

  renderAttTab("register");
});

function renderAttTab(tab) {
  const mount = document.getElementById("attTabContent");
  if (tab === "register") renderRegisterTab(mount);
  else if (tab === "calendar") renderCalendarTab(mount);
  else if (tab === "shifts") renderShiftsTab(mount);
  else if (tab === "overtime") renderOvertimeTab(mount);
}

/* -------------------------- REGISTER ------------------------------------ */

function renderRegisterTab(mount) {
  const user = getCurrentUser();
  mount.innerHTML = `
  <div class="row g-3 mb-3">
    <div class="col-lg-3 col-6">
      <div class="hrm-card h-100"><div class="hrm-card-head">Check In / Out</div><div class="hrm-card-body">
        <div class="text-muted-2 mb-2" style="font-size:.78rem;">${formatDateReadable("2026-09-19")}</div>
        <div class="row text-center mb-3">
          <div class="col-6"><div style="font-size:.7rem;color:var(--text-muted);">Check In</div><div class="fw-bold num" id="regCheckIn">09:24 AM</div></div>
          <div class="col-6"><div style="font-size:.7rem;color:var(--text-muted);">Working</div><div class="fw-bold num" id="regWorking">--</div></div>
        </div>
        <button class="btn btn-primary w-100 btn-sm" id="regCheckBtn">Check Out</button>
      </div></div>
    </div>
    <div class="col-lg-9">
      <div class="row g-3 h-100">
        <div class="col-6 col-lg-3">${kpiCard({ label: "Present Today", value: attendanceKpis.presentToday, icon: "bi-person-check", tint: "success" })}</div>
        <div class="col-6 col-lg-3">${kpiCard({ label: "Absent Today", value: attendanceKpis.absentToday, icon: "bi-person-x", tint: "danger" })}</div>
        <div class="col-6 col-lg-3">${kpiCard({ label: "Late Today", value: attendanceKpis.lateToday, icon: "bi-alarm", tint: "warning" })}</div>
        <div class="col-6 col-lg-3">${kpiCard({ label: "On Leave", value: attendanceKpis.onLeaveToday, icon: "bi-calendar-x", tint: "info" })}</div>
      </div>
    </div>
  </div>

  <div class="filter-bar">
    <div class="row g-2 align-items-end">
      <div class="col-md-4"><label class="form-label">Search</label><input class="form-control" id="attSearch" placeholder="Search employee…"></div>
      <div class="col-6 col-md-3"><label class="form-label">Department</label><select class="form-select" id="attDeptFilter"><option value="">All</option>${departments.map(d => `<option>${d.name}</option>`).join("")}</select></div>
      <div class="col-6 col-md-3"><label class="form-label">Status</label><select class="form-select" id="attStatusFilter"><option value="">All</option>${attendanceStatuses.map(s => `<option>${s}</option>`).join("")}</select></div>
      <div class="col-md-2"><button class="btn btn-light-2 w-100" id="attReset"><i class="bi bi-arrow-counterclockwise"></i> Reset</button></div>
    </div>
  </div>

  <div class="hrm-card">
    <div class="hrm-card-head">Today's Attendance Register</div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Employee</th><th>Check In</th><th>Check Out</th><th>Working Hours</th><th>Overtime</th><th>Status</th></tr></thead>
      <tbody id="attTableBody"></tbody>
    </table></div>
    <div class="hrm-card-body pt-0" id="attPagination"></div>
  </div>`;

  document.getElementById("regCheckBtn").addEventListener("click", () => {
    if (checkState.checkedIn) {
      document.getElementById("regWorking").textContent = "07h 51m";
      const btn = document.getElementById("regCheckBtn");
      btn.textContent = "Checked Out"; btn.disabled = true; btn.classList.replace("btn-primary", "btn-light-2");
      showToast("Checked out successfully.", "success");
      checkState.checkedIn = false;
    }
  });

  document.getElementById("attSearch").addEventListener("input", debounce(e => { attState.search = e.target.value.toLowerCase(); attState.page = 1; renderAttTable(); }, 200));
  document.getElementById("attDeptFilter").addEventListener("change", e => { attState.dept = e.target.value; attState.page = 1; renderAttTable(); });
  document.getElementById("attStatusFilter").addEventListener("change", e => { attState.status = e.target.value; attState.page = 1; renderAttTable(); });
  document.getElementById("attReset").addEventListener("click", () => {
    attState = { search: "", dept: "", status: "", page: 1, perPage: 8 };
    document.getElementById("attSearch").value = ""; document.getElementById("attDeptFilter").value = ""; document.getElementById("attStatusFilter").value = "";
    renderAttTable();
  });
  document.getElementById("attExportBtn").addEventListener("click", () => showToast("Export functionality will be connected to backend later.", "info"));

  renderAttTable();
}

function renderAttTable() {
  let data = attendanceToday.filter(a => {
    if (attState.search && !a.name.toLowerCase().includes(attState.search)) return false;
    if (attState.dept && a.department !== attState.dept) return false;
    if (attState.status && a.status !== attState.status) return false;
    return true;
  });
  const pageData = paginate(data, attState.page, attState.perPage);
  const body = document.getElementById("attTableBody");
  body.innerHTML = pageData.length ? pageData.map(a => `<tr>
    <td>${avatarNameCell(a.avatar, a.name, a.designation)}</td>
    <td class="num">${a.checkIn}</td><td class="num">${a.checkOut}</td><td class="num">${a.workingHours}</td>
    <td class="num">${a.overtime}</td><td>${badgeStatus(a.status)}</td>
  </tr>`).join("") : `<tr><td colspan="6">${emptyState("bi-fingerprint", "No records found", "No attendance records match your filters.")}</td></tr>`;
  renderPagination("attPagination", data.length, attState.perPage, attState.page, (p) => { attState.page = p; renderAttTable(); });
}

/* -------------------------- CALENDAR ------------------------------------- */

function renderCalendarTab(mount) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  mount.innerHTML = `
  <div class="hrm-card">
    <div class="hrm-card-head d-flex justify-content-between align-items-center">
      <button class="btn btn-sm btn-light-2" id="calPrev"><i class="bi bi-chevron-left"></i></button>
      <span id="calLabel" class="fw-bold"></span>
      <button class="btn btn-sm btn-light-2" id="calNext"><i class="bi bi-chevron-right"></i></button>
    </div>
    <div class="hrm-card-body" id="calBody"></div>
  </div>`;
  document.getElementById("calPrev").addEventListener("click", () => { calState.month--; if (calState.month < 0) { calState.month = 11; calState.year--; } drawCalendar(); });
  document.getElementById("calNext").addEventListener("click", () => { calState.month++; if (calState.month > 11) { calState.month = 0; calState.year++; } drawCalendar(); });

  function drawCalendar() {
    document.getElementById("calLabel").textContent = `${monthNames[calState.month]} ${calState.year}`;
    const cal = buildMonthAttendance(calState.year, calState.month);
    document.getElementById("calBody").innerHTML = monthCalendarHtml(cal);
  }
  drawCalendar();
}

/* -------------------------- SHIFTS ---------------------------------------- */

function renderShiftsTab(mount) {
  const canManage = hasPermission("manage_settings") || hasPermission("manage_employees");
  mount.innerHTML = `
  <div class="hrm-card">
    <div class="hrm-card-head d-flex justify-content-between"><span>Shift Management</span>${canManage ? `<button class="btn btn-sm btn-primary" id="addShiftBtn"><i class="bi bi-plus-lg me-1"></i>Add Shift</button>` : ""}</div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Shift Name</th><th>Start</th><th>End</th><th>Break</th><th>Grace Period</th><th>Working Days</th><th>Status</th></tr></thead>
      <tbody>${shifts.map(s => `<tr><td class="cell-primary">${s.name}</td><td class="num">${s.start}</td><td class="num">${s.end}</td><td>${s.breakMins} min</td><td>${s.gracePeriod}</td><td>${s.workingDays}</td><td>${badgeStatus(s.status)}</td></tr>`).join("")}</tbody>
    </table></div>
  </div>`;
  const addBtn = document.getElementById("addShiftBtn");
  if (addBtn) addBtn.addEventListener("click", () => showToast("Shift creation form would open here (simulated).", "info"));
}

/* -------------------------- OVERTIME -------------------------------------- */

function renderOvertimeTab(mount) {
  const canApprove = hasPermission("manage_leave") || hasPermission("approve_team_leave") || hasPermission("manage_employees");
  mount.innerHTML = `
  <div class="hrm-card">
    <div class="hrm-card-head">Overtime Requests</div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Employee</th><th>Date</th><th>Regular Hrs</th><th>OT Hrs</th><th>Rate</th><th>Amount</th><th>Status</th>${canApprove ? "<th>Actions</th>" : ""}</tr></thead>
      <tbody id="otBody"></tbody>
    </table></div>
  </div>`;
  drawOvertime();

  function drawOvertime() {
    document.getElementById("otBody").innerHTML = overtimeRecords.map((o, i) => `<tr>
      <td class="cell-primary">${o.employee}</td><td>${formatDateReadable(o.date)}</td><td class="num">${o.regularHours}h</td>
      <td class="num">${o.overtimeHours}h</td><td class="num">${formatINR(o.rate)}</td><td class="num">${formatINR(o.amount)}</td><td>${badgeStatus(o.status)}</td>
      ${canApprove ? `<td>${o.status === "Pending" ? `<button class="btn btn-sm btn-outline-primary me-1" data-i="${i}" data-act="Approved"><i class="bi bi-check2"></i></button><button class="btn btn-sm btn-light-2" data-i="${i}" data-act="Rejected"><i class="bi bi-x"></i></button>` : "—"}</td>` : ""}
    </tr>`).join("");
    document.querySelectorAll("#otBody [data-act]").forEach(b => b.addEventListener("click", () => {
      overtimeRecords[b.dataset.i].status = b.dataset.act;
      showToast(`Overtime request ${b.dataset.act.toLowerCase()}.`, b.dataset.act === "Approved" ? "success" : "danger");
      drawOvertime();
    }));
  }
}
