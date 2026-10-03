/* ==========================================================================
   RECRUITMENT.JS
   ========================================================================== */

let jobCounter = 106;
const recState = { jobSearch: "", jobStatus: "", candStage: "" };

document.addEventListener("DOMContentLoaded", () => {
  const canManage = hasPermission("manage_recruitment");
  renderPageHeader("pageHeaderMount", "Recruitment", "Track open roles, candidates and interviews across the hiring pipeline.",
    canManage ? `<button class="btn btn-primary" id="addJobBtn"><i class="bi bi-plus-lg me-1"></i>Add Job</button>` : "");

  document.getElementById("jobDept").innerHTML = departments.map(d => `<option>${d.name}</option>`).join("");

  const addBtn = document.getElementById("addJobBtn");
  if (addBtn) addBtn.addEventListener("click", () => bootstrap.Modal.getOrCreateInstance(document.getElementById("jobModal")).show());
  document.getElementById("saveJobBtn").addEventListener("click", () => {
    const form = document.getElementById("jobForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    jobs.unshift({
      id: `JOB-${++jobCounter}`, title: document.getElementById("jobTitle").value, department: document.getElementById("jobDept").value,
      location: document.getElementById("jobLoc").value, employmentType: document.getElementById("jobType").value,
      experience: document.getElementById("jobExp").value, applicants: 0, postedDate: "2026-09-19", deadline: document.getElementById("jobDeadline").value,
      status: "Open", salaryRange: document.getElementById("jobSalary").value, description: document.getElementById("jobDesc").value,
      responsibilities: [], requirements: [], skills: [], benefits: []
    });
    showToast("Job opening published successfully.", "success");
    bootstrap.Modal.getInstance(document.getElementById("jobModal")).hide();
    form.reset();
    renderRecruitTab("jobs");
  });

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderRecruitTab(btn.dataset.tab);
  }));

  renderRecruitTab("dashboard");
});

function renderRecruitTab(tab) {
  const mount = document.getElementById("recruitTabContent");
  if (tab === "dashboard") mount.innerHTML = recDashboardHtml();
  else if (tab === "jobs") { mount.innerHTML = jobsTabHtml(); wireJobsTab(); }
  else if (tab === "candidates") { mount.innerHTML = candidatesTabHtml(); wireCandidatesTab(); }
  else if (tab === "interviews") mount.innerHTML = interviewsTabHtml();
  else if (tab === "offers") mount.innerHTML = offersTabHtml();
}

/* ---------------------------------------------------------------------- */
/* DASHBOARD                                                                */
/* ---------------------------------------------------------------------- */

function recDashboardHtml() {
  return `
  <div class="row g-3 mb-4">
    <div class="col-6 col-lg-3">${kpiCard({ label: "Open Positions", value: recruitmentSummary.openPositions, icon: "bi-briefcase", tint: "brand" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Candidates", value: recruitmentSummary.totalCandidates, icon: "bi-people", tint: "info" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Interviews Scheduled", value: recruitmentSummary.interviews, icon: "bi-calendar-event", tint: "warning" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Offers Extended", value: recruitmentSummary.offers, icon: "bi-envelope-paper", tint: "success" })}</div>
  </div>
  <div class="hrm-card mb-4">
    <div class="hrm-card-head">Recruitment Funnel</div>
    <div class="hrm-card-body">${funnelRow()}</div>
  </div>
  <div class="row g-3">
    <div class="col-lg-6">
      <div class="hrm-card">
        <div class="hrm-card-head d-flex justify-content-between"><span>Open Job Openings</span><a href="#" data-tab="jobs" onclick="document.querySelector('[data-tab=jobs]').click();return false;" style="font-size:.78rem;font-weight:600;">View all</a></div>
        <div class="table-wrap"><table class="hrm-table">
          <thead><tr><th>Job Title</th><th>Applicants</th><th>Status</th></tr></thead>
          <tbody>${jobs.filter(j => j.status === "Open").slice(0, 5).map(j => `<tr><td class="cell-primary">${j.title}</td><td>${j.applicants}</td><td>${badgeStatus(j.status)}</td></tr>`).join("")}</tbody>
        </table></div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="hrm-card">
        <div class="hrm-card-head d-flex justify-content-between"><span>Upcoming Interviews</span><a href="#" onclick="document.querySelector('[data-tab=interviews]').click();return false;" style="font-size:.78rem;font-weight:600;">View all</a></div>
        <div class="hrm-card-body pt-2">
          ${interviews.filter(i => i.status === "Scheduled").slice(0, 4).map(i => `
            <div class="d-flex justify-content-between align-items-center py-2" style="border-bottom:1px solid var(--border-color);">
              <div><div style="font-weight:600;font-size:.85rem;">${i.candidate}</div><div style="font-size:.74rem;color:var(--text-muted);">${i.position} · ${i.type}</div></div>
              <div class="text-end" style="font-size:.78rem;color:var(--text-muted);">${formatDateReadable(i.date)}<br>${i.time}</div>
            </div>`).join("")}
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* JOB OPENINGS                                                             */
/* ---------------------------------------------------------------------- */

function jobsTabHtml() {
  return `
  <div class="filter-bar mb-3">
    <div class="row g-2 align-items-end">
      <div class="col-md-5"><label class="form-label">Search</label><input class="form-control" id="jobSearch" placeholder="Search job title..."></div>
      <div class="col-md-4"><label class="form-label">Status</label><select class="form-select" id="jobStatusFilter"><option value="">All Status</option><option>Open</option><option>Paused</option><option>Closed</option></select></div>
      <div class="col-md-3"><button class="btn btn-light-2 w-100" id="jobResetBtn">Reset</button></div>
    </div>
  </div>
  <div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th>Job Title</th><th>Department</th><th>Location</th><th>Type</th><th>Experience</th><th>Applicants</th><th>Posted</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody id="jobsTbody"></tbody>
  </table></div></div>`;
}

function wireJobsTab() {
  document.getElementById("jobSearch").addEventListener("input", debounce(e => { recState.jobSearch = e.target.value; renderJobsTable(); }, 250));
  document.getElementById("jobStatusFilter").addEventListener("change", e => { recState.jobStatus = e.target.value; renderJobsTable(); });
  document.getElementById("jobResetBtn").addEventListener("click", () => {
    recState.jobSearch = ""; recState.jobStatus = "";
    document.getElementById("jobSearch").value = ""; document.getElementById("jobStatusFilter").value = "";
    renderJobsTable();
  });
  renderJobsTable();
}

function renderJobsTable() {
  const canManage = hasPermission("manage_recruitment");
  const s = recState.jobSearch.toLowerCase();
  const filtered = jobs.filter(j => (!s || j.title.toLowerCase().includes(s)) && (!recState.jobStatus || j.status === recState.jobStatus));
  const tbody = document.getElementById("jobsTbody");
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="10">${emptyState("bi-briefcase", "No Job Openings Found", "There are no job postings matching your search.")}</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(j => `<tr>
    <td class="cell-primary">${j.title}</td><td>${j.department}</td><td>${j.location}</td><td>${j.employmentType}</td><td>${j.experience}</td>
    <td>${j.applicants}</td><td>${formatDateReadable(j.postedDate)}</td><td>${formatDateReadable(j.deadline)}</td><td>${badgeStatus(j.status)}</td>
    <td>
      <button class="btn btn-sm btn-light-2 me-1" data-view="${j.id}"><i class="bi bi-eye"></i></button>
      ${canManage ? `<div class="dropdown d-inline-block">
        <button class="btn btn-sm btn-light-2" data-bs-toggle="dropdown"><i class="bi bi-three-dots"></i></button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#" data-pause="${j.id}">Pause Job</a></li>
          <li><a class="dropdown-item" href="#" data-close="${j.id}">Close Job</a></li>
        </ul>
      </div>` : ""}
    </td>
  </tr>`).join("");

  tbody.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => showJobDetail(btn.dataset.view)));
  tbody.querySelectorAll("[data-pause]").forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); jobs.find(j => j.id === a.dataset.pause).status = "Paused"; showToast("Job paused.", "warning"); renderJobsTable(); }));
  tbody.querySelectorAll("[data-close]").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault();
    confirmAction("Close this job?", "Candidates will no longer be able to apply.", () => {
      jobs.find(j => j.id === a.dataset.close).status = "Closed";
      showToast("Job closed.", "danger");
      renderJobsTable();
    });
  }));
}

function showJobDetail(id) {
  const j = jobs.find(x => x.id === id);
  document.getElementById("jobDetailBody").innerHTML = `
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
      <div><h5 class="mb-1">${j.title}</h5><div style="font-size:.82rem;color:var(--text-muted);">${j.department} · ${j.location} · ${j.employmentType}</div></div>
      ${badgeStatus(j.status)}
    </div>
    <div class="row g-3 mb-3">
      <div class="col-md-4">${infoItem("Experience", j.experience)}</div>
      <div class="col-md-4">${infoItem("Salary Range", j.salaryRange)}</div>
      <div class="col-md-4">${infoItem("Applicants", j.applicants)}</div>
      <div class="col-md-4">${infoItem("Posted Date", formatDateReadable(j.postedDate))}</div>
      <div class="col-md-4">${infoItem("Deadline", formatDateReadable(j.deadline))}</div>
    </div>
    <p style="font-size:.86rem;">${j.description}</p>
    ${j.responsibilities.length ? `<h6 class="mt-3" style="font-size:.85rem;">Responsibilities</h6><ul>${j.responsibilities.map(r => `<li style="font-size:.84rem;">${r}</li>`).join("")}</ul>` : ""}
    ${j.requirements.length ? `<h6 class="mt-3" style="font-size:.85rem;">Requirements</h6><ul>${j.requirements.map(r => `<li style="font-size:.84rem;">${r}</li>`).join("")}</ul>` : ""}
    ${j.skills.length ? `<div class="mt-3 d-flex gap-2 flex-wrap">${j.skills.map(s => `<span class="badge-status st-open">${s}</span>`).join("")}</div>` : ""}
  `;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("jobDetailModal")).show();
}

/* ---------------------------------------------------------------------- */
/* CANDIDATES                                                               */
/* ---------------------------------------------------------------------- */

const candidateStages = ["Applied", "Screening", "Interview", "Technical", "HR Round", "Selected", "Offer", "Rejected", "Hired"];

function candidatesTabHtml() {
  return `
  <div class="filter-bar mb-3">
    <div class="row g-2 align-items-end">
      <div class="col-md-5"><label class="form-label">Search</label><input class="form-control" id="candSearch" placeholder="Search candidate or position..."></div>
      <div class="col-md-4"><label class="form-label">Stage</label><select class="form-select" id="candStageFilter"><option value="">All Stages</option>${candidateStages.map(s => `<option>${s}</option>`).join("")}</select></div>
      <div class="col-md-3"><button class="btn btn-light-2 w-100" id="candResetBtn">Reset</button></div>
    </div>
  </div>
  <div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th>Candidate</th><th>Position</th><th>Experience</th><th>Location</th><th>Applied</th><th>Stage</th><th>Rating</th><th>Recruiter</th></tr></thead>
    <tbody id="candTbody"></tbody>
  </table></div></div>`;
}

function wireCandidatesTab() {
  document.getElementById("candSearch").addEventListener("input", debounce(e => { recState.candSearch = e.target.value; renderCandidatesTable(); }, 250));
  document.getElementById("candStageFilter").addEventListener("change", e => { recState.candStage = e.target.value; renderCandidatesTable(); });
  document.getElementById("candResetBtn").addEventListener("click", () => {
    recState.candSearch = ""; recState.candStage = "";
    document.getElementById("candSearch").value = ""; document.getElementById("candStageFilter").value = "";
    renderCandidatesTable();
  });
  renderCandidatesTable();
}

function renderCandidatesTable() {
  const s = (recState.candSearch || "").toLowerCase();
  const filtered = candidates.filter(c => (!s || c.name.toLowerCase().includes(s) || c.position.toLowerCase().includes(s)) && (!recState.candStage || c.stage === recState.candStage));
  const tbody = document.getElementById("candTbody");
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyState("bi-person-x", "No Candidates Found", "There are no candidates matching your search.")}</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(c => `<tr>
    <td>${avatarNameCell(c.avatar, c.name, c.email)}</td><td>${c.position}</td><td>${c.experience}</td><td>${c.location}</td>
    <td>${formatDateReadable(c.appliedDate)}</td><td>${badgeStatus(c.stage)}</td><td>${starRating(c.rating)}</td><td>${c.recruiter}</td>
  </tr>`).join("");
}

/* ---------------------------------------------------------------------- */
/* INTERVIEWS                                                               */
/* ---------------------------------------------------------------------- */

function interviewsTabHtml() {
  return `<div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th>Candidate</th><th>Position</th><th>Interviewer</th><th>Date</th><th>Time</th><th>Type</th><th>Location / Meeting</th><th>Status</th></tr></thead>
    <tbody>${interviews.length ? interviews.map(i => `<tr>
      <td class="cell-primary">${i.candidate}</td><td>${i.position}</td><td>${i.interviewer}</td><td>${formatDateReadable(i.date)}</td><td>${i.time}</td>
      <td>${badgeStatus(i.type)}</td><td>${i.location}</td><td>${badgeStatus(i.status)}</td>
    </tr>`).join("") : `<tr><td colspan="8">${emptyState("bi-calendar-x", "No Interviews Scheduled", "There are no interviews scheduled at the moment.")}</td></tr>`}</tbody>
  </table></div></div>`;
}

/* ---------------------------------------------------------------------- */
/* OFFERS                                                                   */
/* ---------------------------------------------------------------------- */

function offersTabHtml() {
  const canManage = hasPermission("manage_recruitment");
  return `<div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th>Candidate</th><th>Position</th><th>Salary</th><th>Offer Date</th><th>Joining Date</th><th>Status</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead>
    <tbody>${offers.length ? offers.map((o, i) => `<tr>
      <td class="cell-primary">${o.candidate}</td><td>${o.position}</td><td class="num">${o.salary}</td>
      <td>${formatDateReadable(o.offerDate)}</td><td>${formatDateReadable(o.joiningDate)}</td><td>${badgeStatus(o.status)}</td>
      ${canManage ? `<td><button class="btn btn-sm btn-light-2" onclick="showToast('Offer letter preview will be connected to backend later.','info')"><i class="bi bi-eye me-1"></i>View Offer</button></td>` : ""}
    </tr>`).join("") : `<tr><td colspan="7">${emptyState("bi-envelope", "No Offers Yet", "No offers have been extended yet.")}</td></tr>`}</tbody>
  </table></div></div>`;
}
