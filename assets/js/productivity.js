/* ==========================================================================
   PRODUCTIVITY.JS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderPageHeader("pageHeaderMount", "Tasks &amp; Timesheet", "Manage your daily tasks, log hours and request time away from the desk.", "");
  document.getElementById("taskAssignee").innerHTML = employees.map(e => `<option>${e.name}</option>`).join("");

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProdTab(btn.dataset.tab);
  }));

  wireModals();
  renderProdTab("tasks");
});

function renderProdTab(tab) {
  const mount = document.getElementById("prodTabContent");
  if (tab === "tasks") { mount.innerHTML = tasksHtml(); wireTaskCheckboxes(); }
  else if (tab === "timesheet") mount.innerHTML = timesheetHtml();
  else if (tab === "wfh") { mount.innerHTML = wfhHtml(); wireWfhActions(); }
  else if (tab === "travel") { mount.innerHTML = travelHtml(); wireTravelActions(); }
}

/* ---------------------------------------------------------------------- */
/* TASKS                                                                    */
/* ---------------------------------------------------------------------- */

function tasksHtml() {
  const canAssign = hasPermission("assign_tasks");
  return `
  <div class="d-flex justify-content-end mb-3 no-print">
    ${canAssign ? `<button class="btn btn-primary btn-sm" onclick="bootstrap.Modal.getOrCreateInstance(document.getElementById('taskModal')).show()"><i class="bi bi-plus-lg me-1"></i>Assign Task</button>` : ""}
  </div>
  <div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th></th><th>Task</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Progress</th><th>Status</th></tr></thead>
    <tbody id="taskTbody">${tasks.length ? tasks.map((t, i) => `<tr>
      <td><input type="checkbox" class="form-check-input" data-taskdone="${i}" ${t.status === "Completed" ? "checked" : ""}></td>
      <td class="cell-primary ${t.status === "Completed" ? "text-decoration-line-through text-muted-2" : ""}">${t.task}</td><td>${t.assignedTo}</td>
      <td>${priorityPill(t.priority)}</td><td>${formatDateReadable(t.dueDate)}</td>
      <td><div class="d-flex align-items-center gap-2"><div class="progress flex-grow-1" style="height:6px;max-width:90px;"><div class="progress-bar" style="width:${t.progress}%;background:var(--brand);"></div></div><span class="num" style="font-size:.78rem;">${t.progress}%</span></div></td>
      <td>${badgeStatus(t.status)}</td>
    </tr>`).join("") : `<tr><td colspan="7">${emptyState("bi-list-check", "No Tasks", "There are no tasks assigned right now.")}</td></tr>`}</tbody>
  </table></div></div>`;
}

function wireTaskCheckboxes() {
  document.querySelectorAll("[data-taskdone]").forEach(cb => cb.addEventListener("change", () => {
    const t = tasks[cb.dataset.taskdone];
    t.status = cb.checked ? "Completed" : "In Progress";
    t.progress = cb.checked ? 100 : Math.min(t.progress, 90);
    showToast(cb.checked ? `Marked "${t.task}" as complete.` : `"${t.task}" reopened.`, cb.checked ? "success" : "info");
    renderProdTab("tasks");
  }));
}

/* ---------------------------------------------------------------------- */
/* TIMESHEET                                                                */
/* ---------------------------------------------------------------------- */

function timesheetHtml() {
  return `
  <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
    <div style="font-weight:700;">${timesheetWeek.weekLabel}</div>
    <button class="btn btn-primary btn-sm no-print" onclick="showToast('Timesheet submitted for approval.','success')"><i class="bi bi-send me-1"></i>Submit Week</button>
  </div>
  <div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th>Date</th><th>Day</th><th>Project</th><th>Task</th><th>Start</th><th>End</th><th>Total Hours</th><th>Status</th></tr></thead>
    <tbody>${timesheetWeek.entries.map(e => `<tr>
      <td>${formatDateReadable(e.date)}</td><td>${e.day}</td><td>${e.project}</td><td>${e.task}</td>
      <td>${e.startTime}</td><td>${e.endTime}</td><td class="num">${e.totalHours}</td><td>${badgeStatus(e.status)}</td>
    </tr>`).join("")}
    <tr style="font-weight:700;background:var(--surface-2);"><td colspan="6" class="text-end">Total this week</td><td class="num">${timesheetWeek.total}</td><td></td></tr>
    </tbody>
  </table></div></div>`;
}

/* ---------------------------------------------------------------------- */
/* WFH REQUESTS                                                             */
/* ---------------------------------------------------------------------- */

function wfhHtml() {
  const canApprove = hasPermission("approve_team_leave") || hasPermission("manage_employees");
  return `
  <div class="d-flex justify-content-end mb-3 no-print">
    <button class="btn btn-primary btn-sm" onclick="bootstrap.Modal.getOrCreateInstance(document.getElementById('wfhModal')).show()"><i class="bi bi-house-door me-1"></i>Request WFH</button>
  </div>
  <div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th>Employee</th><th>Date</th><th>Work Location</th><th>Reason</th><th>Manager</th><th>Status</th>${canApprove ? "<th>Actions</th>" : ""}</tr></thead>
    <tbody id="wfhTbody">${wfhRequests.length ? wfhRequests.map((w, i) => `<tr>
      <td class="cell-primary">${w.employee}</td><td>${formatDateReadable(w.date)}</td><td>${w.workLocation}</td><td style="max-width:200px;">${w.reason}</td><td>${w.manager}</td><td>${badgeStatus(w.status)}</td>
      ${canApprove ? `<td>${w.status === "Pending" ? `<button class="btn btn-sm btn-outline-success me-1" data-wfhapprove="${i}"><i class="bi bi-check-lg"></i></button><button class="btn btn-sm btn-outline-danger" data-wfhreject="${i}"><i class="bi bi-x-lg"></i></button>` : `<span class="text-muted-2" style="font-size:.78rem;">—</span>`}</td>` : ""}
    </tr>`).join("") : `<tr><td colspan="7">${emptyState("bi-house-x", "No WFH Requests", "There are no work-from-home requests right now.")}</td></tr>`}</tbody>
  </table></div></div>`;
}

function wireWfhActions() {
  document.querySelectorAll("[data-wfhapprove]").forEach(btn => btn.addEventListener("click", () => { wfhRequests[btn.dataset.wfhapprove].status = "Approved"; showToast("WFH request approved.", "success"); renderProdTab("wfh"); }));
  document.querySelectorAll("[data-wfhreject]").forEach(btn => btn.addEventListener("click", () => { wfhRequests[btn.dataset.wfhreject].status = "Rejected"; showToast("WFH request rejected.", "danger"); renderProdTab("wfh"); }));
}

/* ---------------------------------------------------------------------- */
/* TRAVEL REQUESTS                                                          */
/* ---------------------------------------------------------------------- */

function travelHtml() {
  const canApprove = hasPermission("approve_team_leave") || hasPermission("manage_employees");
  return `
  <div class="d-flex justify-content-end mb-3 no-print">
    <button class="btn btn-primary btn-sm" onclick="bootstrap.Modal.getOrCreateInstance(document.getElementById('travelModal')).show()"><i class="bi bi-airplane me-1"></i>Request Travel</button>
  </div>
  <div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th>Employee</th><th>Destination</th><th>Travel Date</th><th>Return Date</th><th>Purpose</th><th>Est. Cost</th><th>Status</th>${canApprove ? "<th>Actions</th>" : ""}</tr></thead>
    <tbody id="travelTbody">${travelRequests.length ? travelRequests.map((t, i) => `<tr>
      <td class="cell-primary">${t.employee}</td><td>${t.destination}</td><td>${formatDateReadable(t.travelDate)}</td><td>${formatDateReadable(t.returnDate)}</td>
      <td style="max-width:180px;">${t.purpose}</td><td class="num">${formatINR(t.estimatedCost)}</td><td>${badgeStatus(t.status)}</td>
      ${canApprove ? `<td>${t.status === "Pending" ? `<button class="btn btn-sm btn-outline-success me-1" data-travelapprove="${i}"><i class="bi bi-check-lg"></i></button><button class="btn btn-sm btn-outline-danger" data-travelreject="${i}"><i class="bi bi-x-lg"></i></button>` : `<span class="text-muted-2" style="font-size:.78rem;">—</span>`}</td>` : ""}
    </tr>`).join("") : `<tr><td colspan="8">${emptyState("bi-airplane", "No Travel Requests", "There are no travel requests right now.")}</td></tr>`}</tbody>
  </table></div></div>`;
}

function wireTravelActions() {
  document.querySelectorAll("[data-travelapprove]").forEach(btn => btn.addEventListener("click", () => { travelRequests[btn.dataset.travelapprove].status = "Approved"; showToast("Travel request approved.", "success"); renderProdTab("travel"); }));
  document.querySelectorAll("[data-travelreject]").forEach(btn => btn.addEventListener("click", () => { travelRequests[btn.dataset.travelreject].status = "Rejected"; showToast("Travel request rejected.", "danger"); renderProdTab("travel"); }));
}

/* ---------------------------------------------------------------------- */
/* MODAL WIRING                                                             */
/* ---------------------------------------------------------------------- */

function wireModals() {
  document.getElementById("saveTaskBtn").addEventListener("click", () => {
    const form = document.getElementById("taskForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    tasks.unshift({ task: document.getElementById("taskTitle").value, assignedTo: document.getElementById("taskAssignee").value, priority: document.getElementById("taskPriority").value, dueDate: document.getElementById("taskDue").value, progress: 0, status: "Todo" });
    showToast("Task assigned successfully.", "success");
    bootstrap.Modal.getInstance(document.getElementById("taskModal")).hide();
    form.reset();
    renderProdTab("tasks");
  });

  document.getElementById("saveWfhBtn").addEventListener("click", () => {
    const form = document.getElementById("wfhForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const user = getCurrentUser();
    const emp = getEmployeeById(user.empRef);
    wfhRequests.unshift({ employee: user.name, date: document.getElementById("wfhDate").value, reason: document.getElementById("wfhReason").value, workLocation: document.getElementById("wfhLocation").value, manager: emp ? emp.manager : "—", status: "Pending" });
    showToast("WFH request submitted.", "success");
    bootstrap.Modal.getInstance(document.getElementById("wfhModal")).hide();
    form.reset();
    renderProdTab("wfh");
  });

  document.getElementById("saveTravelBtn").addEventListener("click", () => {
    const form = document.getElementById("travelForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    travelRequests.unshift({ employee: getCurrentUser().name, destination: document.getElementById("travelDest").value, travelDate: document.getElementById("travelStart").value, returnDate: document.getElementById("travelEnd").value, purpose: document.getElementById("travelPurpose").value, estimatedCost: Number(document.getElementById("travelCost").value), accommodation: "Yes", transportation: "Flight", stage: "Pending", status: "Pending" });
    showToast("Travel request submitted.", "success");
    bootstrap.Modal.getInstance(document.getElementById("travelModal")).hide();
    form.reset();
    renderProdTab("travel");
  });
}
