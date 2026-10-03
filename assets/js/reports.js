/* ==========================================================================
   REPORTS.JS
   ========================================================================== */

const reportCategories = [
  { key: "employee", label: "Employee Reports", icon: "bi-people", tint: "brand", perm: () => true },
  { key: "attendance", label: "Attendance Reports", icon: "bi-fingerprint", tint: "success", perm: () => hasPermission("view_attendance") },
  { key: "leave", label: "Leave Reports", icon: "bi-calendar2-week", tint: "warning", perm: () => hasPermission("manage_leave") || hasPermission("apply_leave") },
  { key: "payroll", label: "Payroll Reports", icon: "bi-cash-stack", tint: "info", perm: () => hasPermission("view_payroll") },
  { key: "performance", label: "Performance Reports", icon: "bi-graph-up-arrow", tint: "danger", perm: () => hasPermission("manage_performance") || hasPermission("review_performance") }
];

let activeReport = "employee";

document.addEventListener("DOMContentLoaded", () => {
  renderPageHeader("pageHeaderMount", "Reports", "Generate and export reports across every module of NimbusHR.", "");

  const available = reportCategories.filter(c => c.perm());
  activeReport = available[0].key;

  document.getElementById("reportCategoryMount").innerHTML = available.map(c => `
    <div class="col-6 col-lg-3">
      <div class="hrm-card report-cat-card ${c.key === activeReport ? "active" : ""}" data-report="${c.key}" style="cursor:pointer;text-align:center;">
        <div class="kpi-icon bg-tint-${c.tint} mx-auto mb-2"><i class="bi ${c.icon}"></i></div>
        <div style="font-weight:700;font-size:.86rem;">${c.label}</div>
      </div>
    </div>`).join("");

  document.querySelectorAll("[data-report]").forEach(card => card.addEventListener("click", () => {
    activeReport = card.dataset.report;
    document.querySelectorAll("[data-report]").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    renderFilters();
    renderReportTable();
  }));

  document.getElementById("exportCsvBtn").addEventListener("click", () => showToast("CSV export will be connected to backend later.", "info"));
  document.getElementById("exportXlsBtn").addEventListener("click", () => showToast("Excel export will be connected to backend later.", "info"));
  document.getElementById("exportPdfBtn").addEventListener("click", () => showToast("PDF export will be connected to backend later.", "info"));
  document.getElementById("exportPrintBtn").addEventListener("click", () => window.print());

  renderFilters();
  renderReportTable();
});

function renderFilters() {
  document.getElementById("filterMount").innerHTML = `
    <div class="row g-2 align-items-end">
      <div class="col-md-3"><label class="form-label">From</label><input type="date" class="form-control" value="2026-09-01"></div>
      <div class="col-md-3"><label class="form-label">To</label><input type="date" class="form-control" value="2026-09-19"></div>
      <div class="col-md-3"><label class="form-label">Department</label><select class="form-select" id="repDeptFilter"><option value="">All Departments</option>${departments.map(d => `<option>${d.name}</option>`).join("")}</select></div>
      <div class="col-md-3"><button class="btn btn-primary w-100" id="repApplyBtn"><i class="bi bi-funnel me-1"></i>Apply Filters</button></div>
    </div>`;
  document.getElementById("repApplyBtn").addEventListener("click", renderReportTable);
}

function renderReportTable() {
  const dept = document.getElementById("repDeptFilter") ? document.getElementById("repDeptFilter").value : "";
  const table = document.getElementById("reportTable");
  const cat = reportCategories.find(c => c.key === activeReport);
  document.getElementById("reportTableTitle").textContent = cat.label;

  if (activeReport === "employee") {
    const rows = employees.filter(e => !dept || e.department === dept);
    table.innerHTML = `<thead><tr><th>Employee ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Employment Type</th><th>Joining Date</th><th>Status</th></tr></thead>
      <tbody>${rows.map(e => `<tr><td>${e.id}</td><td class="cell-primary">${e.name}</td><td>${e.department}</td><td>${e.designation}</td><td>${e.employmentType}</td><td>${formatDateReadable(e.joiningDate)}</td><td>${badgeStatus(e.status)}</td></tr>`).join("")}</tbody>`;
  } else if (activeReport === "attendance") {
    const rows = attendanceToday.filter(a => !dept || a.department === dept);
    table.innerHTML = `<thead><tr><th>Employee</th><th>Department</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Working Hours</th><th>Status</th></tr></thead>
      <tbody>${rows.map(a => `<tr><td class="cell-primary">${a.name}</td><td>${a.department}</td><td>${formatDateReadable(a.date)}</td><td>${a.checkIn}</td><td>${a.checkOut}</td><td>${a.workingHours}</td><td>${badgeStatus(a.status)}</td></tr>`).join("")}</tbody>`;
  } else if (activeReport === "leave") {
    table.innerHTML = `<thead><tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
      <tbody>${leaveRequests.map(r => `<tr><td class="cell-primary">${r.employee}</td><td>${r.type}</td><td>${formatDateReadable(r.from)}</td><td>${formatDateReadable(r.to)}</td><td>${r.days}</td><td>${badgeStatus(r.status)}</td></tr>`).join("")}</tbody>`;
  } else if (activeReport === "payroll") {
    const rows = payrollRuns.filter(p => !dept || p.department === dept);
    table.innerHTML = `<thead><tr><th>Employee</th><th>Department</th><th>Gross</th><th>Deductions</th><th>Tax</th><th>Net Salary</th><th>Status</th></tr></thead>
      <tbody>${rows.map(p => `<tr><td class="cell-primary">${p.name}</td><td>${p.department}</td><td class="num">${formatINR(p.gross)}</td><td class="num">${formatINR(p.deductions)}</td><td class="num">${formatINR(p.tax)}</td><td class="num">${formatINR(p.net)}</td><td>${badgeStatus(p.status)}</td></tr>`).join("")}</tbody>`;
  } else if (activeReport === "performance") {
    const rows = reviews.filter(r => !dept || r.department === dept);
    table.innerHTML = `<thead><tr><th>Employee</th><th>Department</th><th>Review Period</th><th>Completion</th><th>Rating</th><th>Status</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td class="cell-primary">${r.employee}</td><td>${r.department}</td><td>${r.reviewPeriod}</td><td>${r.completion}%</td><td>${r.rating ? starRating(Math.round(r.rating)) : "—"}</td><td>${badgeStatus(r.status)}</td></tr>`).join("")}</tbody>`;
  }
}
