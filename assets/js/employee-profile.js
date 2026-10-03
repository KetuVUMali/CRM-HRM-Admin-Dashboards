/* ==========================================================================
   EMPLOYEE-PROFILE.JS
   ========================================================================== */

let profileEmp = null;

document.addEventListener("DOMContentLoaded", () => {
  const id = qs("id") || getCurrentUser().empRef;
  profileEmp = getEmployeeById(id) || employees[0];

  document.getElementById("profAvatar").src = profileEmp.avatar;
  document.getElementById("profName").textContent = profileEmp.name;
  document.getElementById("profRole").textContent = `${profileEmp.designation} · ${profileEmp.department}`;
  document.getElementById("profId").textContent = profileEmp.id;
  document.getElementById("profBadges").innerHTML = badgeStatus(profileEmp.status) + `<span class="badge-status st-holiday">${profileEmp.employmentType}</span>`;

  document.querySelectorAll("#profileTabs .nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#profileTabs .nav-link").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProfileTab(btn.dataset.tab);
    });
  });

  renderProfileTab("overview");
});

function renderProfileTab(tab) {
  const mount = document.getElementById("profileTabContent");
  const e = profileEmp;
  if (tab === "overview") {
    mount.innerHTML = `
    <div class="row g-3">
      <div class="col-lg-8">
        <div class="hrm-card mb-3"><div class="hrm-card-head">About</div><div class="hrm-card-body">
          <div class="row g-3">
            ${infoItem("Email", e.email)}${infoItem("Phone", e.phone)}${infoItem("Department", e.department)}
            ${infoItem("Designation", e.designation)}${infoItem("Manager", e.manager)}${infoItem("Work Location", e.workLocation)}
          </div>
        </div></div>
        <div class="hrm-card"><div class="hrm-card-head">Recent Activity</div><div class="hrm-card-body">
          <ul class="timeline">
            <li><div class="t-title">Checked in at 09:24 AM</div><div class="t-meta">Today</div></li>
            <li><div class="t-title">Leave request approved — Sick Leave (1 day)</div><div class="t-meta">2 days ago</div></li>
            <li><div class="t-title">Submitted expense claim — Travel ₹4,200</div><div class="t-meta">9 days ago</div></li>
            <li><div class="t-title">Joined ${e.department} team</div><div class="t-meta">${formatDateReadable(e.joiningDate)}</div></li>
          </ul>
        </div></div>
      </div>
      <div class="col-lg-4">
        <div class="hrm-card mb-3"><div class="hrm-card-head">Leave Balance</div><div class="hrm-card-body">
          ${leaveRow("Annual", leaveBalance.annual, "brand")}${leaveRow("Casual", leaveBalance.casual, "info")}${leaveRow("Sick", leaveBalance.sick, "warning")}
        </div></div>
        <div class="hrm-card"><div class="hrm-card-head">This Month</div><div class="hrm-card-body">
          <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Attendance</span><span class="fw-bold">94.2%</span></div>
          <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Net Pay</span><span class="fw-bold">${formatINR(e.net)}</span></div>
          <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Open Tasks</span><span class="fw-bold">${tasks.filter(t => t.assignedTo === e.name && t.status !== "Completed").length}</span></div>
        </div></div>
      </div>
    </div>`;
  } else if (tab === "personal") {
    mount.innerHTML = cardWrap("Personal Information", `<div class="row g-3">
      ${infoItem("Full Name", e.name)}${infoItem("Gender", e.gender)}${infoItem("Date of Birth", e.dob === "—" ? "—" : formatDateReadable(e.dob))}
      ${infoItem("Marital Status", e.maritalStatus)}${infoItem("Blood Group", e.bloodGroup)}${infoItem("City", e.city)}
      ${infoItem("State", e.state)}${infoItem("Country", e.country)}${infoItem("Emergency Contact", "Rakesh " + e.lastName + " (Spouse) · +91 90000 22222")}
    </div>`);
  } else if (tab === "employment") {
    mount.innerHTML = cardWrap("Employment Details", `<div class="row g-3">
      ${infoItem("Employee ID", e.id)}${infoItem("Department", e.department)}${infoItem("Designation", e.designation)}
      ${infoItem("Joining Date", formatDateReadable(e.joiningDate))}${infoItem("Manager", e.manager)}${infoItem("Employment Type", e.employmentType)}
      ${infoItem("Work Location", e.workLocation)}${infoItem("Status", e.status)}
    </div>`);
  } else if (tab === "attendance") {
    const cal = buildMonthAttendance(2026, 8);
    mount.innerHTML = cardWrap("Attendance — September 2026", monthCalendarHtml(cal));
  } else if (tab === "leave") {
    const myLeaves = leaveRequests.filter(l => l.employee === e.name);
    mount.innerHTML = cardWrap("Leave History", `<div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
      <tbody>${myLeaves.map(l => `<tr><td>${l.type}</td><td>${formatDateReadable(l.from)}</td><td>${formatDateReadable(l.to)}</td><td>${l.days}</td><td>${l.reason}</td><td>${badgeStatus(l.status)}</td></tr>`).join("") || `<tr><td colspan="6">${emptyState("bi-calendar2-week", "No leave history", "No leave records found for this employee.")}</td></tr>`}</tbody>
    </table></div>`);
  } else if (tab === "payroll") {
    mount.innerHTML = cardWrap("Salary Breakdown — September 2026", `
      <div class="row g-3">
        <div class="col-md-6">
          <div style="font-size:.8rem;font-weight:700;color:var(--text-muted);margin-bottom:.4rem;">EARNINGS</div>
          ${payLine("Basic Salary", e.basic)}${payLine("HRA", e.hra)}${payLine("Allowances", e.allowances)}${payLine("Bonus", e.bonus)}
          <div class="d-flex justify-content-between pt-2 border-top mt-2" style="border-color:var(--border-color)!important;"><b>Gross Earnings</b><b class="num">${formatINR(e.gross)}</b></div>
        </div>
        <div class="col-md-6">
          <div style="font-size:.8rem;font-weight:700;color:var(--text-muted);margin-bottom:.4rem;">DEDUCTIONS</div>
          ${payLine("Provident Fund + Other", e.deductions)}${payLine("Income Tax (TDS)", e.tax)}
          <div class="d-flex justify-content-between pt-2 border-top mt-2" style="border-color:var(--border-color)!important;"><b>Total Deductions</b><b class="num">${formatINR(e.deductions + e.tax)}</b></div>
          <div class="d-flex justify-content-between pt-3"><span class="fw-bold" style="font-size:1.05rem;">Net Pay</span><span class="fw-bold num" style="font-size:1.05rem;color:var(--brand);">${formatINR(e.net)}</span></div>
        </div>
      </div>
      <a href="payslip.html?id=${e.id}" class="btn btn-primary mt-3"><i class="bi bi-receipt me-1"></i>View Full Payslip</a>`);
  } else if (tab === "documents") {
    const myDocs = documents.filter(d => d.owner === e.name);
    mount.innerHTML = cardWrap("Documents", `<div class="row g-3">${myDocs.length ? myDocs.map(docCardHtml).join("") : `<div class="col-12">${emptyState("bi-folder2", "No documents", "No documents uploaded for this employee yet.")}</div>`}</div>`);
  } else if (tab === "assets") {
    const myAssets = assets.filter(a => a.assignedTo === e.name);
    mount.innerHTML = cardWrap("Assigned Assets", `<div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Asset</th><th>Category</th><th>Serial No.</th><th>Assigned Date</th><th>Condition</th></tr></thead>
      <tbody>${myAssets.map(a => `<tr><td class="cell-primary">${a.name}</td><td>${a.category}</td><td>${a.serialNumber}</td><td>${formatDateReadable(a.assignedDate)}</td><td>${a.condition}</td></tr>`).join("") || `<tr><td colspan="5">${emptyState("bi-laptop", "No assets assigned", "This employee has no assigned assets.")}</td></tr>`}</tbody>
    </table></div>`);
  } else if (tab === "performance") {
    const myGoals = goals.filter(g => g.employee === e.name);
    const myReview = reviews.find(r => r.employee === e.name);
    mount.innerHTML = `
    <div class="hrm-card mb-3"><div class="hrm-card-head">Goals</div><div class="hrm-card-body">
      ${myGoals.map(g => `<div class="mb-3"><div class="d-flex justify-content-between" style="font-size:.85rem;"><span>${g.goal}</span><span class="fw-semibold">${g.progress}%</span></div><div class="progress"><div class="progress-bar" style="width:${g.progress}%"></div></div></div>`).join("") || emptyState("bi-bullseye", "No goals set", "No active goals for this cycle.")}
    </div></div>
    ${myReview ? `<div class="hrm-card"><div class="hrm-card-head">Latest Review — ${myReview.reviewPeriod}</div><div class="hrm-card-body">
      <div class="d-flex justify-content-between mb-2"><span class="text-muted-2">Rating</span><span>${starRating(Math.round(myReview.rating))} <b class="ms-1">${myReview.rating || "—"}</b></span></div>
      <p style="font-size:.85rem;"><b>Strengths:</b> ${myReview.strengths || "—"}</p>
      <p style="font-size:.85rem;"><b>Development Areas:</b> ${myReview.developmentAreas || "—"}</p>
      <p style="font-size:.85rem;"><b>Manager Feedback:</b> ${myReview.managerFeedback || "—"}</p>
    </div></div>` : emptyState("bi-graph-up", "No review yet", "A performance review has not been recorded for this employee.")}`;
  } else if (tab === "activity") {
    mount.innerHTML = cardWrap("Activity Log", `<ul class="timeline">
      <li><div class="t-title">Profile viewed by ${getCurrentUser().name}</div><div class="t-meta">Just now</div></li>
      <li><div class="t-title">Payslip generated — September 2026</div><div class="t-meta">Today</div></li>
      <li><div class="t-title">Checked in at 09:24 AM</div><div class="t-meta">Today</div></li>
      <li><div class="t-title">Employment record updated</div><div class="t-meta">3 weeks ago</div></li>
      <li><div class="t-title">Joined NimbusHR</div><div class="t-meta">${formatDateReadable(e.joiningDate)}</div></li>
    </ul>`);
  }
}

/* infoItem, payLine, cardWrap, docCardHtml, monthCalendarHtml now live in components.js (shared across pages) */
