/* ==========================================================================
   PERFORMANCE.JS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderPageHeader("pageHeaderMount", "Performance Management", "Track goals, reviews and appraisal cycles across the organization.", "");

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPerfTab(btn.dataset.tab);
  }));

  renderPerfTab("dashboard");
});

function renderPerfTab(tab) {
  const mount = document.getElementById("perfTabContent");
  if (tab === "dashboard") mount.innerHTML = perfDashboardHtml();
  else if (tab === "goals") mount.innerHTML = goalsTabHtml();
  else if (tab === "reviews") { mount.innerHTML = reviewsTabHtml(); wireReviewsTab(); }
}

/* ---------------------------------------------------------------------- */
/* DASHBOARD                                                                */
/* ---------------------------------------------------------------------- */

function perfDashboardHtml() {
  const reviewed = reviews.filter(r => r.status === "Completed").length;
  const pendingReviews = reviews.filter(r => r.status === "Pending").length;
  const avgCompletion = Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length);

  return `
  <div class="row g-3 mb-4">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Employees Reviewed", value: reviewed, icon: "bi-person-check", tint: "success" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Pending Reviews", value: pendingReviews, icon: "bi-hourglass-split", tint: "warning" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Completed Reviews", value: reviewed, icon: "bi-clipboard2-check", tint: "brand" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Avg. Goal Completion", value: avgCompletion + "%", icon: "bi-bullseye", tint: "info" })}</div>
  </div>
  <div class="hrm-card">
    <div class="hrm-card-head">Performance Overview</div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Employee</th><th>Department</th><th>Review Period</th><th>Goals</th><th>Completion</th><th>Rating</th><th>Status</th></tr></thead>
      <tbody>${reviews.map(r => `<tr>
        <td class="cell-primary">${r.employee}</td><td>${r.department}</td><td>${r.reviewPeriod}</td><td>${r.goalsCount}</td>
        <td><div class="d-flex align-items-center gap-2"><div class="progress flex-grow-1" style="height:6px;max-width:90px;"><div class="progress-bar bg-brand" style="width:${r.completion}%;background:var(--brand);"></div></div><span class="num" style="font-size:.78rem;">${r.completion}%</span></div></td>
        <td>${r.rating ? starRating(Math.round(r.rating)) : "—"}</td><td>${badgeStatus(r.status)}</td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* GOALS                                                                    */
/* ---------------------------------------------------------------------- */

function goalsTabHtml() {
  const statusColor = { "Not Started": "muted", "In Progress": "info", "Completed": "success", "Overdue": "danger" };
  return `<div class="hrm-card">
    <div class="hrm-card-head">Goals &amp; OKRs</div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Goal</th><th>Employee</th><th>Department</th><th>Start Date</th><th>Due Date</th><th>Progress</th><th>Status</th></tr></thead>
      <tbody>${goals.map(g => `<tr>
        <td class="cell-primary" style="max-width:240px;">${g.goal}</td><td>${g.employee}</td><td>${g.department}</td>
        <td>${formatDateReadable(g.startDate)}</td><td>${formatDateReadable(g.dueDate)}</td>
        <td><div class="d-flex align-items-center gap-2"><div class="progress flex-grow-1" style="height:6px;max-width:90px;"><div class="progress-bar" style="width:${g.progress}%;background:var(--${statusColor[g.status] === "muted" ? "text-muted" : statusColor[g.status]});"></div></div><span class="num" style="font-size:.78rem;">${g.progress}%</span></div></td>
        <td>${badgeStatus(g.status)}</td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* REVIEWS                                                                  */
/* ---------------------------------------------------------------------- */

function reviewsTabHtml() {
  return `<div class="hrm-card">
    <div class="hrm-card-head">Performance Reviews — H1 2026</div>
    <div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Employee</th><th>Department</th><th>Review Period</th><th>Completion</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${reviews.map((r, i) => `<tr>
        <td class="cell-primary">${r.employee}</td><td>${r.department}</td><td>${r.reviewPeriod}</td><td>${r.completion}%</td>
        <td>${r.rating ? starRating(Math.round(r.rating)) : "—"}</td><td>${badgeStatus(r.status)}</td>
        <td><button class="btn btn-sm btn-light-2" data-review="${i}"><i class="bi bi-eye me-1"></i>View</button></td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

function wireReviewsTab() {
  document.querySelectorAll("[data-review]").forEach(btn => btn.addEventListener("click", () => showReviewDetail(reviews[btn.dataset.review])));
}

function showReviewDetail(r) {
  const body = document.getElementById("reviewModalBody");
  if (r.status === "Pending") {
    body.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div><h5 class="mb-1">${r.employee}</h5><div style="font-size:.82rem;color:var(--text-muted);">${r.department} · ${r.reviewPeriod}</div></div>
        ${badgeStatus(r.status)}
      </div>
      ${emptyState("bi-hourglass-split", "Review Not Yet Submitted", "This performance review is still pending manager and employee feedback.")}
    `;
  } else {
    body.innerHTML = `
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div><h5 class="mb-1">${r.employee}</h5><div style="font-size:.82rem;color:var(--text-muted);">${r.department} · ${r.reviewPeriod}</div></div>
        <div class="text-end">${starRating(Math.round(r.rating))}<div style="font-size:.78rem;font-weight:700;color:var(--brand);margin-top:.2rem;">${r.finalRating}</div></div>
      </div>
      <div class="row g-3">
        <div class="col-md-6">${cardWrap("Goals", `${r.goalsCount} goals · ${r.completion}% average completion`)}</div>
        <div class="col-md-6">${cardWrap("Strengths", r.strengths)}</div>
        <div class="col-md-6">${cardWrap("Development Areas", r.developmentAreas)}</div>
        <div class="col-md-6">${cardWrap("Final Rating", r.finalRating)}</div>
        <div class="col-12">${cardWrap("Manager Feedback", r.managerFeedback)}</div>
        <div class="col-12">${cardWrap("Employee Feedback", r.employeeFeedback)}</div>
      </div>
    `;
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById("reviewModal")).show();
}
