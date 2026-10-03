/* ==========================================================================
   ONBOARDING.JS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderPageHeader("pageHeaderMount", "Onboarding", "Track new joiners through their onboarding checklist.", "");
  renderKpis();
  renderJoiners();
});

function renderKpis() {
  const pending = newJoiners.filter(j => j.progress < 100).length;
  const completed = newJoiners.filter(j => j.progress === 100).length;
  const docsPending = newJoiners.filter(j => !j.completed.includes("Documents Uploaded")).length;
  document.getElementById("kpiMount").innerHTML = `
    <div class="col-6 col-lg-3">${kpiCard({ label: "New Joiners", value: newJoiners.length, icon: "bi-person-plus", tint: "brand" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Pending Onboarding", value: pending, icon: "bi-hourglass-split", tint: "warning" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Completed", value: completed, icon: "bi-check-circle", tint: "success" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Documents Pending", value: docsPending, icon: "bi-file-earmark-excel", tint: "danger" })}</div>
  `;
}

function renderJoiners() {
  const canManage = hasPermission("manage_onboarding");
  const mount = document.getElementById("joinersMount");
  if (!newJoiners.length) {
    mount.innerHTML = `<div class="col-12">${emptyState("bi-person-plus", "No New Joiners", "There are no employees currently in onboarding.")}</div>`;
    return;
  }
  mount.innerHTML = newJoiners.map((j, idx) => `
    <div class="col-lg-6" data-aos="fade-up">
      <div class="hrm-card h-100">
        <div class="hrm-card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="d-flex align-items-center gap-2">
              <img src="${j.avatar}" class="avatar-sm" style="width:44px;height:44px;" alt="${j.name}">
              <div>
                <div style="font-weight:700;">${j.name}</div>
                <div style="font-size:.78rem;color:var(--text-muted);">${j.designation} · ${j.department}</div>
              </div>
            </div>
            <div class="text-end">
              <div style="font-size:.72rem;color:var(--text-muted);">Joining</div>
              <div style="font-size:.82rem;font-weight:600;">${formatDateReadable(j.joiningDate)}</div>
            </div>
          </div>
          <div class="d-flex justify-content-between mb-1" style="font-size:.8rem;">
            <span>Onboarding Progress</span><span class="num" style="font-weight:700;">${j.progress}%</span>
          </div>
          <div class="progress mb-3" style="height:7px;"><div class="progress-bar bg-success" style="width:${j.progress}%;"></div></div>
          <div>
            ${onboardingChecklist.map(item => {
              const done = j.completed.includes(item);
              return `<div class="checklist-item ${done ? "done" : ""}">
                <div class="cl-check">${done ? '<i class="bi bi-check-lg"></i>' : ""}</div>
                <div class="cl-label" style="font-size:.84rem;">${item}</div>
              </div>`;
            }).join("")}
          </div>
          ${canManage ? `<div class="d-flex gap-2 mt-3">
            <button class="btn btn-sm btn-light-2" data-remind="${idx}"><i class="bi bi-bell me-1"></i>Send Reminder</button>
            ${j.progress < 100 ? `<button class="btn btn-sm btn-primary" data-complete="${idx}"><i class="bi bi-check2-all me-1"></i>Mark Next Step Done</button>` : `<span class="badge-status st-completed align-self-center">Fully Onboarded</span>`}
          </div>` : ""}
        </div>
      </div>
    </div>`).join("");

  mount.querySelectorAll("[data-remind]").forEach(btn => btn.addEventListener("click", () => showToast(`Reminder sent to ${newJoiners[btn.dataset.remind].name}.`, "info")));
  mount.querySelectorAll("[data-complete]").forEach(btn => btn.addEventListener("click", () => {
    const j = newJoiners[btn.dataset.complete];
    const next = onboardingChecklist.find(item => !j.completed.includes(item));
    if (next) {
      j.completed.push(next);
      j.progress = Math.round((j.completed.length / onboardingChecklist.length) * 100);
      showToast(`Marked "${next}" as complete for ${j.name}.`, "success");
      renderKpis();
      renderJoiners();
    }
  }));
}
