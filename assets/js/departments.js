/* ==========================================================================
   DEPARTMENTS.JS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const canManage = hasPermission("manage_employees");
  renderPageHeader("pageHeaderMount", "Departments & Organization", "Structure, leadership and reporting lines across NimbusHR.",
    canManage ? `<button class="btn btn-primary" id="addDeptBtn"><i class="bi bi-plus-lg me-1"></i>Add Department</button>` : "");

  document.getElementById("deptHeadSelect").innerHTML = employees.map(e => `<option>${e.name}</option>`).join("");

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderDeptTab(btn.dataset.tab);
  }));

  const addBtn = document.getElementById("addDeptBtn");
  if (addBtn) addBtn.addEventListener("click", () => bootstrap.Modal.getOrCreateInstance(document.getElementById("deptModal")).show());
  document.getElementById("saveDeptBtn").addEventListener("click", () => {
    const form = document.getElementById("deptForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const inputs = form.querySelectorAll("input");
    departments.push({ name: inputs[0].value, head: document.getElementById("deptHeadSelect").value, employeeCount: 0, location: inputs[1].value, status: "Active" });
    showToast("Department added successfully.", "success");
    bootstrap.Modal.getInstance(document.getElementById("deptModal")).hide();
    form.reset();
    renderDeptTab("departments");
  });

  renderDeptTab("departments");
});

function renderDeptTab(tab) {
  const mount = document.getElementById("deptTabContent");
  const canManage = hasPermission("manage_employees");
  if (tab === "departments") {
    mount.innerHTML = `<div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Department</th><th>Head</th><th>Employees</th><th>Location</th><th>Status</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead>
      <tbody>${departments.map(d => `<tr>
        <td class="cell-primary">${d.name}</td><td>${d.head}</td><td>${employees.filter(e => e.department === d.name).length}</td>
        <td>${d.location}</td><td>${badgeStatus(d.status)}</td>
        ${canManage ? `<td><button class="btn btn-sm btn-light-2"><i class="bi bi-pencil"></i></button></td>` : ""}
      </tr>`).join("")}</tbody>
    </table></div></div>`;
  } else if (tab === "designations") {
    mount.innerHTML = `<div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
      <thead><tr><th>Designation</th><th>Department</th><th>Level</th><th>Employees</th><th>Status</th>${canManage ? "<th>Actions</th>" : ""}</tr></thead>
      <tbody>${designations.map(d => `<tr>
        <td class="cell-primary">${d.title}</td><td>${d.department}</td><td>${d.level}</td>
        <td>${employees.filter(e => e.designation === d.title).length}</td><td>${badgeStatus(d.status)}</td>
        ${canManage ? `<td><button class="btn btn-sm btn-light-2"><i class="bi bi-pencil"></i></button></td>` : ""}
      </tr>`).join("")}</tbody>
    </table></div></div>`;
  } else if (tab === "orgchart") {
    mount.innerHTML = `<div class="hrm-card"><div class="hrm-card-head">Organization Chart</div><div class="hrm-card-body" style="overflow-x:auto;">${orgChartHtml()}</div></div>`;
  }
}

function orgChartHtml() {
  const ceo = getEmployeeById("EMP021");
  const branch = (headName, deptNames) => {
    const head = getEmployeeByName(headName);
    const reports = employees.filter(e => e.manager === headName);
    return `<li>${orgNode(head)}${reports.length ? `<ul>${reports.slice(0, 4).map(r => `<li>${orgNode(r)}</li>`).join("")}</ul>` : ""}</li>`;
  };
  return `<ul class="orgchart-tree">
    <li>${orgNode(ceo)}
      <ul>
        ${branch("Anjali Nair")}
        ${branch("Kavita Joshi")}
        ${branch("Vikram Singh")}
        ${branch("Gaurav Kapoor")}
      </ul>
    </li>
  </ul>`;
}
function orgNode(e) {
  if (!e) return "";
  return `<div class="org-node"><img src="${e.avatar}"><div class="n">${e.name}</div><div class="d">${e.designation}</div></div>`;
}
