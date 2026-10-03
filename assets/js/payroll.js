/* ==========================================================================
   PAYROLL.JS
   ========================================================================== */

const prState = { search: "", dept: "", status: "", page: 1, perPage: 8 };

document.addEventListener("DOMContentLoaded", () => {
  const canProcess = hasPermission("process_payroll");
  renderPageHeader("pageHeaderMount", "Payroll", "Run payroll, manage salary structure and stay on top of tax compliance.",
    canProcess ? `<button class="btn btn-primary" onclick="document.querySelector('[data-tab=processing]').click()"><i class="bi bi-play-fill me-1"></i>Process Payroll</button>` : "");

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPayrollTab(btn.dataset.tab);
  }));

  renderPayrollTab("dashboard");
});

function renderPayrollTab(tab) {
  const mount = document.getElementById("payrollTabContent");
  if (tab === "dashboard") { mount.innerHTML = payrollDashTabHtml(); setTimeout(initPayrollPageCharts, 30); }
  else if (tab === "processing") { mount.innerHTML = processingTabHtml(); wireProcessingTab(); }
  else if (tab === "structure") mount.innerHTML = structureTabHtml();
  else if (tab === "tax") mount.innerHTML = taxTabHtml();
}

/* ---------------------------------------------------------------------- */
/* DASHBOARD TAB                                                            */
/* ---------------------------------------------------------------------- */

function payrollDashTabHtml() {
  return `
  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Gross Payroll", value: formatINR(payrollSummary.grossPayroll), icon: "bi-cash-stack", tint: "brand", trend: "+1.6%", trendLabel: "vs last month" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Net Payroll", value: formatINR(payrollSummary.netPayroll), icon: "bi-wallet2", tint: "success", sub: "After deductions" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Tax (TDS)", value: formatINR(payrollSummary.totalTax), icon: "bi-receipt-cutoff", tint: "warning", sub: "This cycle" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Bonus", value: formatINR(payrollSummary.totalBonus), icon: "bi-gift", tint: "info", sub: "This cycle" })}</div>
  </div>
  <div class="row g-3 mb-3">
    <div class="col-lg-7"><div class="hrm-card h-100"><div class="hrm-card-head">Monthly Payroll Trend</div><div class="hrm-card-body"><canvas id="chartPRTrend" height="230"></canvas></div></div></div>
    <div class="col-lg-5"><div class="hrm-card h-100"><div class="hrm-card-head">Department Salary Distribution</div><div class="hrm-card-body"><canvas id="chartPRDept" height="230"></canvas></div></div></div>
  </div>
  <div class="row g-3">
    <div class="col-lg-6"><div class="hrm-card h-100"><div class="hrm-card-head">Deduction Breakdown</div><div class="hrm-card-body"><canvas id="chartPRDeduction" height="220"></canvas></div></div></div>
    <div class="col-lg-6">
      <div class="hrm-card h-100">
        <div class="hrm-card-head">Payroll Summary</div>
        <div class="hrm-card-body">
          ${payLine("Total Employees", payrollSummary.totalEmployees)}
          ${payLine("Gross Payroll", payrollSummary.grossPayroll)}
          ${payLine("Total Deductions", payrollSummary.totalDeductions)}
          ${payLine("Total Tax (TDS)", payrollSummary.totalTax)}
          ${payLine("Total Bonus", payrollSummary.totalBonus)}
          <hr>
          ${payLine("Net Payroll", payrollSummary.netPayroll)}
        </div>
      </div>
    </div>
  </div>`;
}

function initPayrollPageCharts() {
  const p = chartPalette();
  new Chart(document.getElementById("chartPRTrend"), {
    type: "line",
    data: { labels: monthlyPayrollTrend.map(m => m.month), datasets: [{ label: "Payroll (₹)", data: monthlyPayrollTrend.map(m => m.amount), borderColor: p.brand, backgroundColor: p.brand + "22", tension: .35, fill: true }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: p.text } }, y: { ticks: { color: p.text, callback: v => "₹" + (v / 100000).toFixed(1) + "L" }, grid: { color: p.grid } } } }
  });
  const byDept = departments.map(d => employees.filter(e => e.department === d.name).reduce((s, e) => s + e.gross, 0));
  new Chart(document.getElementById("chartPRDept"), {
    type: "bar",
    data: { labels: departments.map(d => d.name), datasets: [{ label: "Gross Salary", data: byDept, backgroundColor: p.brand, borderRadius: 5 }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: p.text, font: { size: 9 } } }, y: { ticks: { color: p.text, callback: v => (v / 100000) + "L" }, grid: { color: p.grid } } } }
  });
  new Chart(document.getElementById("chartPRDeduction"), {
    type: "doughnut",
    data: { labels: ["Provident Fund", "Professional Tax", "Income Tax", "Other"], datasets: [{ data: [Math.round(payrollSummary.totalDeductions * 0.55), Math.round(payrollSummary.totalDeductions * 0.05), payrollSummary.totalTax, Math.round(payrollSummary.totalDeductions * 0.4)], backgroundColor: [p.brand, p.warning, p.danger, p.info], borderWidth: 0 }] },
    options: { plugins: { legend: { position: "bottom", labels: { color: p.text, boxWidth: 10, font: { size: 11 } } } }, cutout: "62%" }
  });
}

/* ---------------------------------------------------------------------- */
/* PROCESSING TAB                                                           */
/* ---------------------------------------------------------------------- */

function processingTabHtml() {
  return `
  <div class="filter-bar mb-3">
    <div class="row g-2 align-items-end">
      <div class="col-md-3"><label class="form-label">Search Employee</label><input class="form-control" id="prSearch" placeholder="Search..."></div>
      <div class="col-md-3"><label class="form-label">Department</label><select class="form-select" id="prDept"><option value="">All Departments</option>${departments.map(d => `<option>${d.name}</option>`).join("")}</select></div>
      <div class="col-md-3"><label class="form-label">Status</label><select class="form-select" id="prStatus"><option value="">All Status</option><option>Pending</option><option>Review</option><option>Approved</option><option>On Hold</option><option>Processed</option></select></div>
      <div class="col-md-2"><label class="form-label">Month</label><select class="form-select"><option>September 2026</option><option>August 2026</option><option>July 2026</option></select></div>
      <div class="col-md-1"><button class="btn btn-light-2 w-100" id="prReset"><i class="bi bi-arrow-counterclockwise"></i></button></div>
    </div>
  </div>
  <div class="hrm-card">
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Employee</th><th>Basic</th><th>HRA</th><th>Allowances</th><th>Gross</th><th>Deductions</th><th>Tax</th><th>Bonus</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody id="prTbody"></tbody>
    </table></div>
    <div id="prPagination" class="px-3 pb-3"></div>
  </div>`;
}

function getFilteredPayroll() {
  const s = prState.search.toLowerCase();
  return payrollRuns.filter(p =>
    (!s || p.name.toLowerCase().includes(s)) &&
    (!prState.dept || p.department === prState.dept) &&
    (!prState.status || p.status === prState.status)
  );
}

function wireProcessingTab() {
  document.getElementById("prSearch").addEventListener("input", debounce(e => { prState.search = e.target.value; prState.page = 1; renderProcessingTable(); }, 250));
  document.getElementById("prDept").addEventListener("change", e => { prState.dept = e.target.value; prState.page = 1; renderProcessingTable(); });
  document.getElementById("prStatus").addEventListener("change", e => { prState.status = e.target.value; prState.page = 1; renderProcessingTable(); });
  document.getElementById("prReset").addEventListener("click", () => {
    prState.search = ""; prState.dept = ""; prState.status = ""; prState.page = 1;
    document.getElementById("prSearch").value = ""; document.getElementById("prDept").value = ""; document.getElementById("prStatus").value = "";
    renderProcessingTable();
  });
  renderProcessingTable();
}

function renderProcessingTable() {
  const canProcess = hasPermission("process_payroll");
  const tbody = document.getElementById("prTbody");
  const filtered = getFilteredPayroll();
  const rows = paginate(filtered, prState.page, prState.perPage);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="11">${emptyState("bi-cash-coin", "No Payroll Records Found", "There are no payroll records matching your filters.")}</td></tr>`;
  } else {
    tbody.innerHTML = rows.map(p => `<tr>
      <td>${avatarNameCell(p.avatar, p.name, p.department)}</td>
      <td class="num">${formatINR(p.basic)}</td><td class="num">${formatINR(p.hra)}</td><td class="num">${formatINR(p.allowances)}</td>
      <td class="num" style="font-weight:700;">${formatINR(p.gross)}</td><td class="num">${formatINR(p.deductions)}</td><td class="num">${formatINR(p.tax)}</td><td class="num">${formatINR(p.bonus)}</td>
      <td class="num" style="font-weight:700;color:var(--success);">${formatINR(p.net)}</td>
      <td>${badgeStatus(p.status)}</td>
      <td>${payrollActionBtn(p, canProcess)}</td>
    </tr>`).join("");
  }
  renderPagination("prPagination", filtered.length, prState.perPage, prState.page, (pg) => { prState.page = pg; renderProcessingTable(); });
  wirePayrollActions();
}

function payrollActionBtn(p, canProcess) {
  if (p.status === "Processed") return `<a href="payslip.html?id=${p.employeeId}" class="btn btn-sm btn-outline-brand"><i class="bi bi-receipt me-1"></i>Payslip</a>`;
  if (!canProcess) return `<span class="text-muted-2" style="font-size:.78rem;">Awaiting payroll team</span>`;
  if (p.status === "On Hold") return `<button class="btn btn-sm btn-light-2" data-act="resume" data-id="${p.employeeId}">Resume</button>`;
  if (p.status === "Pending") return `<button class="btn btn-sm btn-outline-brand" data-act="calculate" data-id="${p.employeeId}">Calculate</button>`;
  if (p.status === "Review") return `<button class="btn btn-sm btn-outline-warning" data-act="approve" data-id="${p.employeeId}">Approve</button>`;
  if (p.status === "Approved") return `<button class="btn btn-sm btn-success" data-act="process" data-id="${p.employeeId}">Process</button>`;
  return "";
}

function wirePayrollActions() {
  document.querySelectorAll("[data-act]").forEach(btn => btn.addEventListener("click", () => {
    const rec = payrollRuns.find(p => p.employeeId === btn.dataset.id);
    const next = { resume: ["Pending", "Payroll resumed."], calculate: ["Review", "Salary calculated — ready for review."], approve: ["Approved", "Payroll approved."], process: ["Processed", "Payroll processed successfully."] }[btn.dataset.act];
    rec.status = next[0];
    showToast(next[1], "success");
    renderProcessingTable();
  }));
}

/* ---------------------------------------------------------------------- */
/* SALARY STRUCTURE TAB                                                     */
/* ---------------------------------------------------------------------- */

function structureTabHtml() {
  const sample = getEmployeeById("EMP001");
  return `
  <div class="row g-3">
    <div class="col-lg-7">
      <div class="hrm-card">
        <div class="hrm-card-head">Salary Components</div>
        <div class="table-wrap"><table class="hrm-table">
          <thead><tr><th>Component</th><th>Type</th><th>Calculation</th></tr></thead>
          <tbody>${salaryComponents.map(c => `<tr><td class="cell-primary">${c.name}</td><td><span class="badge-status ${c.type === "Earning" ? "st-active" : "st-inactive"}">${c.type}</span></td><td>${c.calc}</td></tr>`).join("")}</tbody>
        </table></div>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="hrm-card">
        <div class="hrm-card-head">Calculation Summary — ${sample.name}</div>
        <div class="hrm-card-body">
          <div style="font-size:.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.03em;" class="mb-2">Earnings</div>
          ${payLine("Basic Salary", sample.basic)}
          ${payLine("HRA", sample.hra)}
          ${payLine("Allowances", sample.allowances)}
          ${payLine("Bonus", sample.bonus)}
          <div style="font-size:.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.03em;" class="mt-3 mb-2">Deductions</div>
          ${payLine("Provident Fund + Other", sample.deductions)}
          ${payLine("Income Tax (TDS)", sample.tax)}
          <hr>
          <div class="d-flex justify-content-between mb-1" style="font-size:.85rem;"><span>Gross Salary</span><span class="num" style="font-weight:700;">${formatINR(sample.gross)}</span></div>
          <div class="d-flex justify-content-between" style="font-size:.95rem;"><span style="font-weight:700;">Net Salary</span><span class="num" style="font-weight:800;color:var(--success);">${formatINR(sample.net)}</span></div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* TAX MANAGEMENT TAB                                                       */
/* ---------------------------------------------------------------------- */

function taxTabHtml() {
  return `
  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Monthly TDS", value: formatINR(payrollSummary.totalTax), icon: "bi-receipt-cutoff", tint: "warning" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Projected Annual TDS", value: formatINR(payrollSummary.totalTax * 12), icon: "bi-calendar-range", tint: "brand" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Employees on New Regime", value: Math.round(employees.length * 0.7), icon: "bi-file-earmark-check", tint: "success" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Employees on Old Regime", value: employees.length - Math.round(employees.length * 0.7), icon: "bi-file-earmark-text", tint: "info" })}</div>
  </div>
  <div class="hrm-card">
    <div class="hrm-card-head">Employee Tax Summary — FY 2026-27</div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Employee</th><th>PAN</th><th>Regime</th><th>Monthly TDS</th><th>Annual Taxable Income (est.)</th><th>Status</th></tr></thead>
      <tbody>${employees.slice(0, 12).map((e, i) => `<tr>
        <td>${avatarNameCell(e.avatar, e.name, e.department)}</td>
        <td class="num">${"ABCDE" + (1000 + i) + "F"}</td>
        <td>${i % 3 === 0 ? "Old Regime" : "New Regime"}</td>
        <td class="num">${formatINR(e.tax)}</td>
        <td class="num">${formatINR(e.gross * 12)}</td>
        <td>${badgeStatus(e.tax > 0 ? "Filed" : "Pending")}</td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}
