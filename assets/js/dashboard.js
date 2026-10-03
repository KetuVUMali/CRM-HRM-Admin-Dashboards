/* ==========================================================================
   DASHBOARD.JS — renders a distinct, role-appropriate dashboard experience.
   Structure per role: Page Header -> KPI Row -> Primary Analytics ->
   Secondary Analytics -> Operational Table -> Activity / Attention -> Quick Actions
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initDashboard, 250); // brief simulated loading state
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function initDashboard() {
  const user = getCurrentUser();
  const mount = document.getElementById("dashboardContent");
  let html = "";
  if (user.role === "employee") html = employeeDashboardHtml(user);
  else if (user.role === "team_lead" || user.role === "manager") html = managerDashboardHtml(user);
  else if (user.role === "hr_manager" || user.role === "hr_executive") html = hrDashboardHtml(user);
  else if (user.role === "payroll_manager") html = payrollDashboardHtml(user);
  else if (user.role === "admin") html = adminDashboardHtml(user);
  else if (user.role === "super_admin") html = superAdminDashboardHtml(user);
  mount.innerHTML = html;
  if (window.AOS) AOS.refreshHard();

  if (user.role === "employee") { wireEmployeeWidgets(user); initEmployeeGauge(); }
  if (user.role === "team_lead" || user.role === "manager") { wireManagerWidgets(user); initManagerChart(user); }
  if (user.role === "hr_manager" || user.role === "hr_executive") initHRCharts();
  if (user.role === "payroll_manager") initPayrollCharts();
  if (user.role === "admin") initAdminCharts();
  if (user.role === "super_admin") initSuperAdminGauge();
}

/* ---------------------------------------------------------------------- */
/* SHARED DASHBOARD WIDGETS                                                 */
/* ---------------------------------------------------------------------- */

function leaveRow(label, bal, tint) {
  const pct = Math.round((bal.remaining / bal.total) * 100);
  return `<div class="mb-2">
    <div class="d-flex justify-content-between" style="font-size:.82rem;"><span>${label}</span><span class="fw-semibold">${bal.remaining}/${bal.total} left</span></div>
    <div class="progress" style="height:6px;"><div class="progress-bar" style="width:${pct}%;background:var(--${tint === "brand" ? "brand" : tint});"></div></div>
  </div>`;
}

/* "Alert / Attention" widget — a short, actionable list of things that need
   attention right now, each linking straight to where it can be resolved. */
function attentionWidget(items) {
  if (!items.length) {
    return `<div class="hrm-card" data-aos="fade-up">
      <div class="hrm-card-head"><i class="bi bi-check2-circle me-1" style="color:var(--success);"></i>Needs Attention</div>
      <div class="hrm-card-body">${emptyState("bi-emoji-smile", "All caught up", "Nothing needs your attention right now.")}</div>
    </div>`;
  }
  return `<div class="hrm-card" data-aos="fade-up">
    <div class="hrm-card-head"><i class="bi bi-exclamation-triangle me-1" style="color:var(--warning);"></i>Needs Attention</div>
    <div class="hrm-card-body pt-2">
      ${items.map(it => `
        <a href="${it.href}" class="attention-item">
          <div class="attention-ic bg-tint-${it.tint || "warning"}"><i class="bi ${it.icon}"></i></div>
          <div class="flex-grow-1"><div class="attention-text">${it.text}</div></div>
          <i class="bi bi-chevron-right" style="color:var(--text-muted);font-size:.78rem;"></i>
        </a>`).join("")}
    </div>
  </div>`;
}

/* Activity timeline — used on org-facing dashboards (HR / Payroll / Admin / Super Admin) */
function activityTimeline(logs, mountTitle) {
  return `<div class="hrm-card h-100" data-aos="fade-up">
    <div class="hrm-card-head d-flex justify-content-between"><span>${mountTitle || "Recent Activity"}</span><a href="settings.html" style="font-size:.78rem;font-weight:600;">View log</a></div>
    <div class="hrm-card-body">
      <ul class="timeline mb-0">
        ${logs.map(a => `<li><div class="t-title"><b>${a.user}</b> ${a.action.toLowerCase()}</div><div class="t-meta">${a.module} · ${a.time}</div></li>`).join("")}
      </ul>
    </div>
  </div>`;
}

/* ======================= EMPLOYEE DASHBOARD ============================ */

function employeeDashboardHtml(user) {
  const emp = getEmployeeById(user.empRef) || employees[0];
  const myTasks = tasks.filter(t => t.assignedTo === user.name).slice(0, 4);
  const myAnnouncements = announcements.filter(a => a.status === "Published").slice(0, 3);
  const nextHolidays = holidays.filter(h => new Date(h.date) >= new Date("2026-09-19")).slice(0, 3);

  return `
  <div class="hrm-card mb-3" style="background:linear-gradient(120deg, var(--brand), var(--brand-dark)); border:none; color:#fff;" data-aos="fade-up">
    <div class="hrm-card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div>
        <h4 class="mb-1" style="color:#fff;font-weight:800;">${greeting()}, ${emp.firstName} 👋</h4>
        <div style="opacity:.9;font-size:.87rem;">Here's what's happening today, ${formatDateReadable("2026-09-19")}.</div>
      </div>
      <img src="${emp.avatar}" class="avatar-lg" alt="${emp.name}" style="border-color:rgba(255,255,255,.5);">
    </div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Attendance This Month", value: "94.2%", icon: "bi-fingerprint", tint: "success", variant: "sparkline", sparklineData: [88, 91, 90, 95, 92, 96, 94], aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Leave Balance", value: (leaveBalance.annual.remaining + leaveBalance.casual.remaining + leaveBalance.sick.remaining + leaveBalance.earned.remaining) + " days", icon: "bi-calendar2-range", tint: "brand", sub: "Across all types", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Tasks Due", value: myTasks.filter(t => t.status !== "Completed").length, icon: "bi-list-check", tint: "warning", sub: "Open items", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Latest Payslip", value: formatINR(emp.net), icon: "bi-receipt", tint: "info", sub: "September 2026", aos: true })}</div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up">
        <div class="hrm-card-head d-flex justify-content-between"><span>Today's Attendance</span><i class="bi bi-fingerprint text-muted-2"></i></div>
        <div class="hrm-card-body">
          <div id="empAttGauge"></div>
          <div class="text-center mb-3"><span class="badge-status st-success">+2.1%</span> <span class="text-muted-2" style="font-size:.78rem;">vs last month</span></div>
          <div class="d-flex justify-content-between mb-2"><span class="text-muted-2" style="font-size:.82rem;">Status</span><span id="empAttStatus">${badgeStatus("Present")}</span></div>
          <div class="row text-center mb-3">
            <div class="col-4"><div style="font-size:.7rem;color:var(--text-muted);">Check In</div><div id="empCheckIn" class="fw-bold num">09:24 AM</div></div>
            <div class="col-4"><div style="font-size:.7rem;color:var(--text-muted);">Check Out</div><div id="empCheckOut" class="fw-bold num">--</div></div>
            <div class="col-4"><div style="font-size:.7rem;color:var(--text-muted);">Working</div><div id="empWorking" class="fw-bold num">--</div></div>
          </div>
          <button class="btn btn-primary w-100" id="empCheckBtn">Check Out</button>
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up" data-aos-delay="50">
        <div class="hrm-card-head d-flex justify-content-between"><span>Leave Balance</span><a href="leave.html" style="font-size:.78rem;font-weight:600;">Apply</a></div>
        <div class="hrm-card-body">
          ${leaveRow("Annual Leave", leaveBalance.annual, "brand")}
          ${leaveRow("Casual Leave", leaveBalance.casual, "info")}
          ${leaveRow("Sick Leave", leaveBalance.sick, "warning")}
          ${leaveRow("Earned Leave", leaveBalance.earned, "success")}
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up" data-aos-delay="100">
        <div class="hrm-card-head d-flex justify-content-between"><span>Latest Payslip</span><a href="payslip.html" style="font-size:.78rem;font-weight:600;">View</a></div>
        <div class="hrm-card-body">
          <div style="font-size:.78rem;color:var(--text-muted);">September 2026 · Net Pay</div>
          <div class="kpi-value mb-2">${formatINR(emp.net)}</div>
          <div class="d-flex justify-content-between border-top pt-2 mb-1" style="border-color:var(--border-color)!important;font-size:.8rem;"><span class="text-muted-2">Gross Earnings</span><span class="fw-semibold">${formatINR(emp.gross)}</span></div>
          <div class="d-flex justify-content-between mb-1" style="font-size:.8rem;"><span class="text-muted-2">Deductions</span><span class="fw-semibold">${formatINR(emp.deductions + emp.tax)}</span></div>
          <div class="d-flex justify-content-between" style="font-size:.8rem;"><span class="text-muted-2">Status</span>${badgeStatus("Paid")}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-8">
      <div class="hrm-card mb-3" data-aos="fade-up">
        <div class="hrm-card-head">Quick Actions</div>
        <div class="hrm-card-body">
          <div class="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-2">
            <div><a class="quick-action-btn" href="leave.html"><i class="bi bi-calendar2-plus"></i>Apply Leave</a></div>
            <div><a class="quick-action-btn" href="payslip.html"><i class="bi bi-receipt"></i>View Payslip</a></div>
            <div><a class="quick-action-btn" href="attendance.html"><i class="bi bi-fingerprint"></i>Attendance</a></div>
            <div><a class="quick-action-btn" href="expenses.html"><i class="bi bi-wallet2"></i>Submit Expense</a></div>
            <div><a class="quick-action-btn" href="employee-profile.html"><i class="bi bi-person"></i>My Profile</a></div>
          </div>
        </div>
      </div>

      <div class="hrm-card" data-aos="fade-up">
        <div class="hrm-card-head d-flex justify-content-between"><span>My Tasks</span><a href="productivity.html" style="font-size:.78rem;font-weight:600;">View all</a></div>
        <div class="hrm-card-body pt-2">
          ${myTasks.map(t => `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--border-color)!important;">
              <div>
                <div style="font-size:.85rem;font-weight:600;">${t.task}</div>
                <div style="font-size:.74rem;color:var(--text-muted);">Due ${formatDateReadable(t.dueDate)}</div>
              </div>
              <div class="d-flex align-items-center gap-2">${priorityPill(t.priority)}${badgeStatus(t.status)}</div>
            </div>`).join("") || emptyState("bi-check2-circle", "No tasks", "You're all caught up.")}
        </div>
      </div>
    </div>

    <div class="col-lg-4 d-flex flex-column gap-3">
      <div class="hrm-card" data-aos="fade-up">
        <div class="hrm-card-head">Upcoming Holidays</div>
        <div class="hrm-card-body pt-2">
          ${nextHolidays.map(h => `<div class="d-flex justify-content-between py-1" style="font-size:.82rem;"><span>${h.name}</span><span class="text-muted-2">${formatDateReadable(h.date)}</span></div>`).join("")}
        </div>
      </div>
      <div class="hrm-card" data-aos="fade-up">
        <div class="hrm-card-head">Birthdays & Anniversaries</div>
        <div class="hrm-card-body pt-2">
          ${birthdaysToday.map(b => `<div class="d-flex align-items-center gap-2 py-1"><img src="${b.avatar}" class="avatar-xs" alt="${b.name}"><span style="font-size:.82rem;">🎂 ${b.name}'s birthday today</span></div>`).join("")}
          ${workAnniversaries.map(w => `<div class="d-flex align-items-center gap-2 py-1"><img src="${w.avatar}" class="avatar-xs" alt="${w.name}"><span style="font-size:.82rem;">🎉 ${w.name} · ${w.years} yrs on ${w.date}</span></div>`).join("")}
        </div>
      </div>
      <div class="hrm-card" data-aos="fade-up">
        <div class="hrm-card-head d-flex justify-content-between"><span>Announcements</span><a href="announcements.html" style="font-size:.78rem;font-weight:600;">All</a></div>
        <div class="hrm-card-body pt-2">
          ${myAnnouncements.map(a => `<div class="py-1"><div style="font-size:.83rem;font-weight:600;">${a.title}</div><div style="font-size:.74rem;color:var(--text-muted);">${formatDateReadable(a.publishedDate)}</div></div>`).join("")}
        </div>
      </div>
    </div>
  </div>`;
}

function initEmployeeGauge() {
  const mount = document.getElementById("empAttGauge");
  if (!mount) return;
  mount.innerHTML = `<div style="position:relative;">${gaugeArc({ value: 94.2, color: "var(--brand)" })}
    <div style="position:absolute;left:0;right:0;top:58%;text-align:center;"><div class="num" style="font-size:1.6rem;font-weight:800;">94.2%</div><div style="font-size:.72rem;color:var(--text-muted);">Target: 95%</div></div>
  </div>`;
}

function wireEmployeeWidgets(user) {
  const btn = document.getElementById("empCheckBtn");
  if (!btn) return;
  let checkedIn = true;
  btn.addEventListener("click", () => {
    if (checkedIn) {
      document.getElementById("empCheckOut").textContent = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      document.getElementById("empWorking").textContent = "07h 48m";
      btn.textContent = "Checked Out";
      btn.disabled = true;
      btn.classList.replace("btn-primary", "btn-light-2");
      showToast("Checked out successfully. Have a great evening!", "success");
      checkedIn = false;
    }
  });
}

/* ======================= MANAGER / TEAM LEAD DASHBOARD ================== */

function managerDashboardHtml(user) {
  const team = employees.filter(e => e.manager === user.name);
  const teamNames = team.map(t => t.name);
  const teamAttendanceToday = attendanceToday.filter(a => teamNames.includes(a.name));
  const presentPct = teamAttendanceToday.length ? Math.round((teamAttendanceToday.filter(a => a.status === "Present").length / teamAttendanceToday.length) * 100) : 0;
  const teamOnLeave = teamAttendanceToday.filter(a => a.status === "On Leave").length;
  const pendingApprovals = leaveRequests.filter(l => teamNames.includes(l.employee) && l.status === "Pending");
  const overdueTasks = tasks.filter(t => teamNames.includes(t.assignedTo) && t.status !== "Completed" && new Date(t.dueDate) < new Date("2026-09-19"));

  const attention = [];
  if (pendingApprovals.length) attention.push({ text: `${pendingApprovals.length} leave request${pendingApprovals.length > 1 ? "s" : ""} awaiting your approval`, icon: "bi-calendar2-check", tint: "warning", href: "leave.html" });
  if (overdueTasks.length) attention.push({ text: `${overdueTasks.length} team task${overdueTasks.length > 1 ? "s" : ""} overdue`, icon: "bi-exclamation-circle", tint: "danger", href: "productivity.html" });
  if (teamOnLeave > 0) attention.push({ text: `${teamOnLeave} team member${teamOnLeave > 1 ? "s" : ""} on leave today`, icon: "bi-calendar-x", tint: "info", href: "attendance.html" });

  return `
  <div class="page-header">
    <div><h1 class="page-title">${greeting()}, ${user.name.split(" ")[0]} 👋</h1><p class="page-desc">Here's how your team is doing today.</p></div>
  </div>
  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Team Size", value: team.length, icon: "bi-people", tint: "brand", sub: "Direct reports", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Team Attendance", value: presentPct + "%", icon: "bi-fingerprint", tint: "success", variant: "progress", progress: presentPct, progressLabel: "Present today", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "On Leave Today", value: teamOnLeave, icon: "bi-calendar-x", tint: "warning", sub: "Team members", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Pending Approvals", value: pendingApprovals.length, icon: "bi-hourglass-split", tint: "danger", sub: "Leave requests", aos: true })}</div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-7">
      <div class="hrm-card h-100" data-aos="fade-up">
        <div class="hrm-card-head">Team Attendance — Last 7 Days</div>
        <div class="hrm-card-body"><canvas id="chartTeamAttendance" height="210"></canvas></div>
      </div>
    </div>
    <div class="col-lg-5">${attentionWidget(attention)}</div>
  </div>

  <div class="row g-3">
    <div class="col-lg-8">
      <div class="hrm-card mb-3" data-aos="fade-up">
        <div class="hrm-card-head">My Team</div>
        <div class="table-wrap"><table class="hrm-table">
          <thead><tr><th>Employee</th><th>Designation</th><th>Attendance</th><th>Task Progress</th><th>Status</th></tr></thead>
          <tbody>${team.map(t => {
            const att = attendanceToday.find(a => a.employeeId === t.id);
            const empTasks = tasks.filter(ts => ts.assignedTo === t.name);
            const avgProg = empTasks.length ? Math.round(empTasks.reduce((s, ts) => s + ts.progress, 0) / empTasks.length) : 0;
            return `<tr>
              <td>${avatarNameCell(t.avatar, t.name, t.id)}</td>
              <td>${t.designation}</td>
              <td>${badgeStatus(att ? att.status : "Present")}</td>
              <td style="min-width:120px;"><div class="progress"><div class="progress-bar" style="width:${avgProg}%;"></div></div></td>
              <td>${badgeStatus(t.status)}</td>
            </tr>`;
          }).join("") || `<tr><td colspan="5">${emptyState("bi-people", "No direct reports", "This demo user has no team members mapped.")}</td></tr>`}</tbody>
        </table></div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card" data-aos="fade-up">
        <div class="hrm-card-head">Pending Leave Approvals</div>
        <div class="hrm-card-body pt-2" id="managerApprovalsList">
          ${pendingApprovals.length ? pendingApprovals.map((l, i) => `
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="border-color:var(--border-color)!important;" data-idx="${leaveRequests.indexOf(l)}">
              <div class="d-flex align-items-center gap-2"><img src="${l.avatar}" class="avatar-xs" alt="${l.employee}"><div><div style="font-size:.82rem;font-weight:600;">${l.employee}</div><div style="font-size:.72rem;color:var(--text-muted);">${l.type} · ${l.days}d</div></div></div>
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-primary approve-btn" data-idx="${leaveRequests.indexOf(l)}"><i class="bi bi-check2"></i></button>
                <button class="btn btn-sm btn-light-2 reject-btn" data-idx="${leaveRequests.indexOf(l)}"><i class="bi bi-x"></i></button>
              </div>
            </div>`).join("") : emptyState("bi-check2-circle", "All caught up", "No pending approvals from your team.")}
        </div>
      </div>
    </div>
  </div>`;
}

function initManagerChart(user) {
  const canvas = document.getElementById("chartTeamAttendance");
  if (!canvas) return;
  const p = chartPalette();
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"],
      datasets: [{ label: "Present %", data: [92, 88, 95, 40, 20, 94, 96], backgroundColor: p.brand, borderRadius: 6, maxBarThickness: 34 }]
    },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: p.text } }, y: { max: 100, ticks: { color: p.text, callback: v => v + "%" }, grid: { color: p.grid } } } }
  });
}

function wireManagerWidgets() {
  document.querySelectorAll(".approve-btn").forEach(b => b.addEventListener("click", () => {
    leaveRequests[b.dataset.idx].status = "Approved";
    showToast("Leave request approved.", "success");
    initDashboard();
  }));
  document.querySelectorAll(".reject-btn").forEach(b => b.addEventListener("click", () => {
    confirmAction("Reject this leave request?", "The employee will be notified.", () => {
      leaveRequests[b.dataset.idx].status = "Rejected";
      showToast("Leave request rejected.", "danger");
      initDashboard();
    });
  }));
}

/* ======================= HR MANAGER / EXECUTIVE DASHBOARD ================ */

function hrDashboardHtml(user) {
  const onProbation = employees.filter(e => e.status === "Probation").length;
  const onLeave = attendanceToday.filter(a => a.status === "On Leave").length;
  const newJoinersCount = employees.filter(e => new Date(e.joiningDate) >= new Date("2026-06-01")).length;
  const pendingReviews = reviews.filter(r => r.status === "Pending").length;
  const expiringDocs = documents.filter(d => d.expiryDate !== "—" && new Date(d.expiryDate) < new Date("2026-12-18") && new Date(d.expiryDate) >= new Date("2026-09-19")).length;
  const missingAttendance = attendanceToday.filter(a => a.status === "Absent").length;

  const attention = [];
  if (missingAttendance) attention.push({ text: `${missingAttendance} employee${missingAttendance > 1 ? "s" : ""} marked absent with no leave on record`, icon: "bi-person-x", tint: "danger", href: "attendance.html" });
  if (leaveRequests.filter(l => l.status === "Pending").length) attention.push({ text: `${leaveRequests.filter(l => l.status === "Pending").length} leave requests awaiting approval`, icon: "bi-calendar2-check", tint: "warning", href: "leave.html" });
  if (expiringDocs) attention.push({ text: `${expiringDocs} document${expiringDocs > 1 ? "s are" : " is"} expiring within 90 days`, icon: "bi-file-earmark-excel", tint: "danger", href: "documents.html" });
  if (pendingReviews) attention.push({ text: `${pendingReviews} performance review${pendingReviews > 1 ? "s" : ""} not yet submitted`, icon: "bi-clipboard2-x", tint: "info", href: "performance.html" });

  return `
  <div class="page-header"><div><h1 class="page-title">HR Dashboard</h1><p class="page-desc">Workforce health and hiring at a glance.</p></div>
  <div class="d-flex gap-2">${hasPermission("manage_employees") || hasPermission("edit_employees") ? `<a href="employees.html" class="btn btn-primary"><i class="bi bi-person-plus me-1"></i>Add Employee</a>` : ""}</div></div>

  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Employees", value: employees.length, icon: "bi-people", tint: "brand", trend: "+3", trendLabel: "this quarter", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "New Joiners", value: newJoinersCount, icon: "bi-person-plus", tint: "success", sub: "Last 90 days", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "On Probation", value: onProbation, icon: "bi-hourglass-split", tint: "warning", sub: "Employees", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "On Leave Today", value: onLeave, icon: "bi-calendar-x", tint: "info", sub: "Across teams", aos: true })}</div>
  </div>
  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Attendance %", value: attendanceKpis.attendancePct + "%", icon: "bi-fingerprint", tint: "success", sub: "Today", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Pending Approvals", value: leaveRequests.filter(l => l.status === "Pending").length, icon: "bi-hourglass", tint: "danger", sub: "Leave requests", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Open Positions", value: recruitmentSummary.openPositions, icon: "bi-briefcase", tint: "brand", sub: "Across departments", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Reviews Due", value: pendingReviews, icon: "bi-graph-up-arrow", tint: "warning", sub: "This cycle", aos: true })}</div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up"><div class="hrm-card-head">Department Distribution</div><div class="hrm-card-body"><canvas id="chartDeptDist" height="220"></canvas></div></div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up"><div class="hrm-card-head">Attendance Trend (7 days)</div><div class="hrm-card-body"><canvas id="chartAttTrend" height="220"></canvas></div></div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up"><div class="hrm-card-head">Employment Type</div><div class="hrm-card-body"><canvas id="chartEmpType" height="220"></canvas></div></div>
    </div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-7">
      <div class="hrm-card" data-aos="fade-up">
        <div class="hrm-card-head d-flex justify-content-between"><span>Recruitment Funnel</span><a href="recruitment.html" style="font-size:.78rem;font-weight:600;">Open recruitment</a></div>
        <div class="hrm-card-body">${funnelRow()}</div>
      </div>
    </div>
    <div class="col-lg-5">${attentionWidget(attention)}</div>
  </div>

  <div class="row g-3">
    <div class="col-lg-6">${activityTimeline(auditLogs.slice(0, 5), "Recent HR Activity")}</div>
    <div class="col-lg-6">
      <div class="hrm-card h-100" data-aos="fade-up">
        <div class="hrm-card-head">Birthdays & Work Anniversaries</div>
        <div class="hrm-card-body pt-2">
          ${birthdaysToday.map(b => `<div class="d-flex align-items-center gap-2 py-1"><img src="${b.avatar}" class="avatar-xs" alt="${b.name}"><span style="font-size:.82rem;">🎂 ${b.name} — birthday today</span></div>`).join("")}
          ${upcomingBirthdays.map(b => `<div class="d-flex align-items-center gap-2 py-1"><img src="${b.avatar}" class="avatar-xs" alt="${b.name}"><span style="font-size:.82rem;">${b.name} — ${b.date}</span></div>`).join("")}
          ${workAnniversaries.map(w => `<div class="d-flex align-items-center gap-2 py-1"><img src="${w.avatar}" class="avatar-xs" alt="${w.name}"><span style="font-size:.82rem;">🎉 ${w.name} · ${w.years} yrs on ${w.date}</span></div>`).join("")}
        </div>
      </div>
    </div>
  </div>`;
}

function initHRCharts() {
  const p = chartPalette();
  const deptCounts = departments.map(d => employees.filter(e => e.department === d.name).length);
  new Chart(document.getElementById("chartDeptDist"), {
    type: "doughnut",
    data: { labels: departments.map(d => d.name), datasets: [{ data: deptCounts, backgroundColor: [p.brand, p.info, p.warning, p.success, p.danger, p.accent, "#8a8a8a", "#5c7cfa"], borderWidth: 0 }] },
    options: { plugins: { legend: { position: "bottom", labels: { color: p.text, boxWidth: 10, font: { size: 10 } } } }, cutout: "62%" }
  });
  new Chart(document.getElementById("chartAttTrend"), {
    type: "line",
    data: { labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], datasets: [{ label: "Present %", data: [88, 95, 93, 96, 94, 97, 60], borderColor: p.brand, backgroundColor: p.brand + "22", tension: .35, fill: true }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: p.text }, grid: { display: false } }, y: { ticks: { color: p.text }, grid: { color: p.grid } } } }
  });
  const ftCount = employees.filter(e => e.employmentType === "Full-Time").length;
  const ctCount = employees.filter(e => e.employmentType === "Contract").length;
  new Chart(document.getElementById("chartEmpType"), {
    type: "pie",
    data: { labels: ["Full-Time", "Contract"], datasets: [{ data: [ftCount, ctCount], backgroundColor: [p.brand, p.accent], borderWidth: 0 }] },
    options: { plugins: { legend: { position: "bottom", labels: { color: p.text, boxWidth: 10, font: { size: 10 } } } } }
  });
}

/* ======================= PAYROLL MANAGER DASHBOARD ======================= */

function payrollDashboardHtml(user) {
  const processedCount = payrollRuns.filter(p => p.status === "Processed").length;
  const processedPct = Math.round((processedCount / payrollRuns.length) * 100);
  const attention = [];
  if (payrollSummary.pending) attention.push({ text: `${payrollSummary.pending} employee payroll record${payrollSummary.pending > 1 ? "s" : ""} still pending`, icon: "bi-hourglass-split", tint: "warning", href: "payroll.html" });
  const onHold = payrollRuns.filter(p => p.status === "On Hold").length;
  if (onHold) attention.push({ text: `${onHold} payroll record${onHold > 1 ? "s" : ""} on hold and need review`, icon: "bi-pause-circle", tint: "danger", href: "payroll.html" });

  return `
  <div class="page-header"><div><h1 class="page-title">Payroll Dashboard</h1><p class="page-desc">September 2026 payroll cycle overview.</p></div>
  <div class="d-flex gap-2"><a href="payroll.html" class="btn btn-primary"><i class="bi bi-play-fill me-1"></i>Process Payroll</a></div></div>

  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Gross Payroll", value: formatINR(payrollSummary.grossPayroll), icon: "bi-cash-stack", tint: "brand", trend: "+1.6%", trendLabel: "vs last month", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Net Payroll", value: formatINR(payrollSummary.netPayroll), icon: "bi-wallet2", tint: "success", sub: "After deductions", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Deductions", value: formatINR(payrollSummary.totalDeductions), icon: "bi-dash-circle", tint: "warning", sub: "PF, tax & other", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Pending Runs", value: payrollSummary.pending, icon: "bi-hourglass-split", tint: "danger", sub: "Employees", aos: true })}</div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up">
        <div class="hrm-card-head">Payroll Cycle Progress</div>
        <div class="hrm-card-body">
          <div style="position:relative;">${gaugeArc({ value: processedPct, color: "var(--success)" })}
            <div style="position:absolute;left:0;right:0;top:58%;text-align:center;"><div class="num" style="font-size:1.6rem;font-weight:800;">${processedPct}%</div><div style="font-size:.72rem;color:var(--text-muted);">Processed</div></div>
          </div>
          <div class="text-center mt-2" style="font-size:.8rem;color:var(--text-muted);">${processedCount} of ${payrollRuns.length} employees processed</div>
        </div>
      </div>
    </div>
    <div class="col-lg-8"><div class="hrm-card h-100" data-aos="fade-up"><div class="hrm-card-head">Monthly Payroll Trend</div><div class="hrm-card-body"><canvas id="chartPayrollTrend" height="200"></canvas></div></div></div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-7"><div class="hrm-card h-100" data-aos="fade-up"><div class="hrm-card-head">Department Salary Distribution</div><div class="hrm-card-body"><canvas id="chartDeptSalary" height="220"></canvas></div></div></div>
    <div class="col-lg-5">${attentionWidget(attention)}</div>
  </div>

  <div class="row g-3">
    <div class="col-lg-8">
      <div class="hrm-card" data-aos="fade-up">
        <div class="hrm-card-head">Payroll Status by Employee</div>
        <div class="table-wrap"><table class="hrm-table">
          <thead><tr><th>Employee</th><th>Gross</th><th>Net</th><th>Status</th></tr></thead>
          <tbody>${payrollRuns.slice(0, 6).map(p => `<tr><td>${avatarNameCell(p.avatar, p.name, p.department)}</td><td class="num">${formatINR(p.gross)}</td><td class="num">${formatINR(p.net)}</td><td>${badgeStatus(p.status)}</td></tr>`).join("")}</tbody>
        </table></div>
        <div class="hrm-card-body pt-0"><a href="payroll.html" style="font-size:.82rem;font-weight:600;">View full payroll processing →</a></div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card" data-aos="fade-up">
        <div class="hrm-card-head">Quick Actions</div>
        <div class="hrm-card-body">
          <div class="row g-2">
            <div class="col-6"><a class="quick-action-btn" href="payroll.html"><i class="bi bi-play-fill"></i>Process Payroll</a></div>
            <div class="col-6"><a class="quick-action-btn" href="payslip.html"><i class="bi bi-receipt"></i>Payslips</a></div>
            <div class="col-6"><a class="quick-action-btn" href="payroll.html"><i class="bi bi-diagram-3"></i>Salary Structure</a></div>
            <div class="col-6"><a class="quick-action-btn" href="reports.html"><i class="bi bi-file-earmark-bar-graph"></i>Tax Reports</a></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function initPayrollCharts() {
  const p = chartPalette();
  new Chart(document.getElementById("chartPayrollTrend"), {
    type: "line",
    data: { labels: monthlyPayrollTrend.map(m => m.month), datasets: [{ label: "Payroll (₹)", data: monthlyPayrollTrend.map(m => m.amount), borderColor: p.brand, backgroundColor: p.brand + "22", tension: .35, fill: true }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: p.text } }, y: { ticks: { color: p.text, callback: v => "₹" + (v / 100000).toFixed(1) + "L" }, grid: { color: p.grid } } } }
  });
  const byDept = departments.map(d => employees.filter(e => e.department === d.name).reduce((s, e) => s + e.gross, 0));
  new Chart(document.getElementById("chartDeptSalary"), {
    type: "bar",
    data: { labels: departments.map(d => d.name), datasets: [{ label: "Gross Salary", data: byDept, backgroundColor: p.brand, borderRadius: 5 }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: p.text, font: { size: 9 } } }, y: { ticks: { color: p.text, callback: v => (v / 100000) + "L" }, grid: { color: p.grid } } } }
  });
}

/* ======================= ADMIN DASHBOARD ================================= */

function adminDashboardHtml(user) {
  const expiringDocs = documents.filter(d => d.expiryDate !== "—" && new Date(d.expiryDate) < new Date("2026-12-18") && new Date(d.expiryDate) >= new Date("2026-09-19")).length;
  const attention = [];
  if (leaveRequests.filter(l => l.status === "Pending").length) attention.push({ text: `${leaveRequests.filter(l => l.status === "Pending").length} leave requests awaiting approval`, icon: "bi-calendar2-check", tint: "warning", href: "leave.html" });
  if (payrollSummary.pending) attention.push({ text: `${payrollSummary.pending} payroll record${payrollSummary.pending > 1 ? "s" : ""} pending processing`, icon: "bi-cash-coin", tint: "danger", href: "payroll.html" });
  if (expiringDocs) attention.push({ text: `${expiringDocs} document${expiringDocs > 1 ? "s" : ""} expiring within 90 days`, icon: "bi-file-earmark-excel", tint: "info", href: "documents.html" });

  return `
  <div class="page-header"><div><h1 class="page-title">Admin Dashboard</h1><p class="page-desc">Organization-wide snapshot for ${formatDateReadable("2026-09-19")}.</p></div></div>

  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Employees", value: employees.length, icon: "bi-people", tint: "brand", trend: "+8.4%", trendLabel: "vs last month", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Active Employees", value: employees.filter(e => e.status === "Active").length, icon: "bi-person-check", tint: "success", sub: "Currently active", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Present Today", value: attendanceKpis.presentToday, icon: "bi-fingerprint", tint: "success", sub: attendanceKpis.attendancePct + "% attendance", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "On Leave", value: attendanceKpis.onLeaveToday, icon: "bi-calendar-x", tint: "warning", sub: "Today", aos: true })}</div>
  </div>
  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Absent Today", value: attendanceKpis.absentToday, icon: "bi-x-circle", tint: "danger", sub: "Unplanned", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Open Positions", value: recruitmentSummary.openPositions, icon: "bi-briefcase", tint: "info", sub: "Across teams", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Payroll Pending", value: payrollSummary.pending, icon: "bi-cash-coin", tint: "warning", sub: "Employees", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "New Employees", value: employees.filter(e => new Date(e.joiningDate) >= new Date("2026-06-01")).length, icon: "bi-person-plus", tint: "brand", sub: "Last 90 days", aos: true })}</div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-6"><div class="hrm-card h-100" data-aos="fade-up"><div class="hrm-card-head">Employees by Department</div><div class="hrm-card-body"><canvas id="chartDeptDist" height="230"></canvas></div></div></div>
    <div class="col-lg-6"><div class="hrm-card h-100" data-aos="fade-up"><div class="hrm-card-head">Attendance Overview</div><div class="hrm-card-body"><canvas id="chartAttOverview" height="230"></canvas></div></div></div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up">
        <div class="hrm-card-head d-flex justify-content-between"><span>Leave Requests</span><a href="leave.html" style="font-size:.78rem;font-weight:600;">All</a></div>
        <div class="hrm-card-body pt-2">${leaveRequests.filter(l => l.status === "Pending").slice(0, 4).map(l => `<div class="d-flex justify-content-between py-1" style="font-size:.82rem;"><span>${l.employee}</span>${badgeStatus(l.status)}</div>`).join("")}</div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up">
        <div class="hrm-card-head d-flex justify-content-between"><span>Recruitment</span><a href="recruitment.html" style="font-size:.78rem;font-weight:600;">Open</a></div>
        <div class="hrm-card-body pt-2">
          <div class="d-flex justify-content-between py-1" style="font-size:.82rem;"><span>Open Jobs</span><span class="fw-bold">${recruitmentSummary.openPositions}</span></div>
          <div class="d-flex justify-content-between py-1" style="font-size:.82rem;"><span>Candidates</span><span class="fw-bold">${recruitmentSummary.totalCandidates}</span></div>
          <div class="d-flex justify-content-between py-1" style="font-size:.82rem;"><span>Interviews</span><span class="fw-bold">${recruitmentSummary.interviews}</span></div>
          <div class="d-flex justify-content-between py-1" style="font-size:.82rem;"><span>Offers</span><span class="fw-bold">${recruitmentSummary.offers}</span></div>
        </div>
      </div>
    </div>
    <div class="col-lg-4">${attentionWidget(attention)}</div>
  </div>

  <div class="row g-3">
    <div class="col-12">${activityTimeline(auditLogs.slice(0, 5), "Recent Activities")}</div>
  </div>`;
}

function initAdminCharts() {
  const p = chartPalette();
  const deptCounts = departments.map(d => employees.filter(e => e.department === d.name).length);
  new Chart(document.getElementById("chartDeptDist"), {
    type: "bar",
    data: { labels: departments.map(d => d.name), datasets: [{ data: deptCounts, backgroundColor: p.brand, borderRadius: 5 }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: p.text, font: { size: 9 } } }, y: { ticks: { color: p.text }, grid: { color: p.grid } } } }
  });
  new Chart(document.getElementById("chartAttOverview"), {
    type: "doughnut",
    data: { labels: ["Present", "Absent", "Late", "On Leave"], datasets: [{ data: [attendanceKpis.presentToday, attendanceKpis.absentToday, attendanceKpis.lateToday, attendanceKpis.onLeaveToday], backgroundColor: [p.success, p.danger, p.info, p.warning], borderWidth: 0 }] },
    options: { plugins: { legend: { position: "bottom", labels: { color: p.text, boxWidth: 10, font: { size: 10 } } } }, cutout: "62%" }
  });
}

/* ======================= SUPER ADMIN DASHBOARD ============================ */

function superAdminDashboardHtml(user) {
  const systemAlerts = auditLogs.filter(a => a.status === "Warning" || a.status === "Failed").length;
  const attention = [];
  if (systemAlerts) attention.push({ text: `${systemAlerts} system alert${systemAlerts > 1 ? "s" : ""} need review`, icon: "bi-exclamation-triangle", tint: "danger", href: "settings.html" });
  const inactiveUsers = systemUsers.filter(u => u.status === "Inactive").length;
  if (inactiveUsers) attention.push({ text: `${inactiveUsers} inactive system account${inactiveUsers > 1 ? "s" : ""} could be reviewed`, icon: "bi-person-dash", tint: "warning", href: "settings.html" });

  return `
  <div class="page-header"><div><h1 class="page-title">Super Admin Dashboard</h1><p class="page-desc">System-level overview across NimbusHR.</p></div></div>

  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Users", value: systemUsers.length, icon: "bi-person-lines-fill", tint: "brand", sub: "System accounts", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Active Users", value: systemUsers.filter(u => u.status === "Active").length, icon: "bi-person-check", tint: "success", sub: "Currently active", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Employees", value: employees.length, icon: "bi-people", tint: "info", sub: "Across org", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Departments", value: departments.length, icon: "bi-diagram-3", tint: "brand", sub: "Configured", aos: true })}</div>
  </div>
  <div class="row g-3 mb-3">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Roles Configured", value: roles.length, icon: "bi-shield-lock", tint: "warning", sub: "Access levels", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Pending Approvals", value: leaveRequests.filter(l => l.status === "Pending").length, icon: "bi-hourglass-split", tint: "danger", sub: "Across modules", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "System Alerts", value: systemAlerts, icon: "bi-exclamation-triangle", tint: "danger", sub: "Needs review", aos: true })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Inactive Users", value: inactiveUsers, icon: "bi-person-dash", tint: "info", sub: "Disabled accounts", aos: true })}</div>
  </div>

  <div class="row g-3 mb-3">
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up">
        <div class="hrm-card-head">System Uptime</div>
        <div class="hrm-card-body">
          <div id="sysUptimeGauge" style="position:relative;"></div>
          <div class="text-center mt-2" style="font-size:.8rem;color:var(--text-muted);">Last 30 days · all services operational</div>
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card h-100" data-aos="fade-up">
        <div class="hrm-card-head">System Management</div>
        <div class="hrm-card-body">
          <div class="row g-2">
            <div class="col-6"><a class="quick-action-btn" href="settings.html"><i class="bi bi-person-gear"></i>Users</a></div>
            <div class="col-6"><a class="quick-action-btn" href="settings.html"><i class="bi bi-shield-lock"></i>Roles</a></div>
            <div class="col-6"><a class="quick-action-btn" href="settings.html"><i class="bi bi-key"></i>Permissions</a></div>
            <div class="col-6"><a class="quick-action-btn" href="settings.html"><i class="bi bi-clock-history"></i>Audit Logs</a></div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-4">${attentionWidget(attention)}</div>
  </div>

  <div class="row g-3">
    <div class="col-12">${activityTimeline(auditLogs.slice(0, 6), "Recent Audit Activity")}</div>
  </div>`;
}

function initSuperAdminGauge() {
  const mount = document.getElementById("sysUptimeGauge");
  if (!mount) return;
  mount.innerHTML = `${gaugeArc({ value: 99.7, color: "var(--success)" })}
    <div style="position:absolute;left:0;right:0;top:58%;text-align:center;"><div class="num" style="font-size:1.6rem;font-weight:800;">99.97%</div><div style="font-size:.72rem;color:var(--text-muted);">Uptime</div></div>`;
}
