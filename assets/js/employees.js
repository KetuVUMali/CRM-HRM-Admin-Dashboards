/* ==========================================================================
   EMPLOYEES.JS
   ========================================================================== */

let empState = { search: "", dept: "", desig: "", status: "", sortField: "name", sortDir: "asc", page: 1, perPage: 8 };

document.addEventListener("DOMContentLoaded", () => {
  const canManage = hasPermission("manage_employees") || hasPermission("edit_employees");
  renderPageHeader("pageHeaderMount", "Employees", "Manage your organization's employees.",
    canManage ? `<button class="btn btn-light-2"><i class="bi bi-upload me-1"></i>Import</button><button class="btn btn-primary" id="addEmployeeBtn"><i class="bi bi-person-plus me-1"></i>Add Employee</button>` : "");

  document.getElementById("empDeptFilter").insertAdjacentHTML("beforeend", departments.map(d => `<option>${d.name}</option>`).join(""));
  document.getElementById("empDesigFilter").insertAdjacentHTML("beforeend", [...new Set(employees.map(e => e.designation))].sort().map(d => `<option>${d}</option>`).join(""));
  document.getElementById("formDept").innerHTML = departments.map(d => `<option>${d.name}</option>`).join("");
  document.getElementById("formManager").innerHTML = `<option value="">None</option>` + employees.map(e => `<option>${e.name}</option>`).join("");

  document.getElementById("empSearch").addEventListener("input", debounce(e => { empState.search = e.target.value.toLowerCase(); empState.page = 1; renderEmployeeTable(); }, 200));
  document.getElementById("empDeptFilter").addEventListener("change", e => { empState.dept = e.target.value; empState.page = 1; renderEmployeeTable(); });
  document.getElementById("empDesigFilter").addEventListener("change", e => { empState.desig = e.target.value; empState.page = 1; renderEmployeeTable(); });
  document.getElementById("empStatusFilter").addEventListener("change", e => { empState.status = e.target.value; empState.page = 1; renderEmployeeTable(); });
  document.getElementById("empResetFilters").addEventListener("click", () => {
    empState = { search: "", dept: "", desig: "", status: "", sortField: "name", sortDir: "asc", page: 1, perPage: 8 };
    document.getElementById("empSearch").value = ""; document.getElementById("empDeptFilter").value = "";
    document.getElementById("empDesigFilter").value = ""; document.getElementById("empStatusFilter").value = "";
    renderEmployeeTable();
  });
  document.querySelectorAll("th.sortable").forEach(th => th.addEventListener("click", () => {
    const field = th.dataset.sort;
    empState.sortDir = (empState.sortField === field && empState.sortDir === "asc") ? "desc" : "asc";
    empState.sortField = field;
    renderEmployeeTable();
  }));
  document.getElementById("empExportBtn").addEventListener("click", () => showToast("Export functionality will be connected to backend later.", "info"));

  const addBtn = document.getElementById("addEmployeeBtn");
  if (addBtn) addBtn.addEventListener("click", () => {
    document.getElementById("employeeModalTitle").textContent = "Add Employee";
    document.getElementById("employeeForm").reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById("employeeModal")).show();
  });
  document.getElementById("saveEmployeeBtn").addEventListener("click", () => saveNewEmployee(true));
  document.getElementById("saveContinueBtn").addEventListener("click", () => saveNewEmployee(false));

  renderEmployeeTable();
});

function getFilteredEmployees() {
  let data = employees.filter(e => {
    if (empState.search && !(e.name.toLowerCase().includes(empState.search) || e.email.toLowerCase().includes(empState.search) || e.id.toLowerCase().includes(empState.search))) return false;
    if (empState.dept && e.department !== empState.dept) return false;
    if (empState.desig && e.designation !== empState.desig) return false;
    if (empState.status && e.status !== empState.status) return false;
    return true;
  });
  return sortByField(data, empState.sortField, empState.sortDir);
}

function renderEmployeeTable() {
  const canManage = hasPermission("manage_employees") || hasPermission("edit_employees");
  const canDelete = hasPermission("manage_employees");
  const data = getFilteredEmployees();
  document.getElementById("empResultCount").textContent = `Employees (${data.length})`;
  const pageData = paginate(data, empState.page, empState.perPage);
  const body = document.getElementById("empTableBody");

  if (!data.length) {
    body.innerHTML = `<tr><td colspan="9">${emptyState("bi-people", "No employees found", "There are no employees matching your search.", canManage ? `<button class="btn btn-primary btn-sm" id="emptyAddBtn">Add Employee</button>` : "")}</td></tr>`;
    const eb = document.getElementById("emptyAddBtn"); if (eb) eb.addEventListener("click", () => document.getElementById("addEmployeeBtn").click());
    document.getElementById("empPagination").innerHTML = "";
    return;
  }

  body.innerHTML = pageData.map(e => `
    <tr>
      <td><input type="checkbox" class="form-check-input"></td>
      <td>${avatarNameCell(e.avatar, e.name, e.id + " · " + e.designation)}</td>
      <td>${e.department}</td>
      <td><div style="font-size:.78rem;">${e.email}</div><div style="font-size:.74rem;color:var(--text-muted);">${e.phone}</div></td>
      <td>${formatDateReadable(e.joiningDate)}</td>
      <td>${e.manager}</td>
      <td>${e.employmentType}</td>
      <td>${badgeStatus(e.status)}</td>
      <td>
        <div class="dropdown">
          <button class="btn btn-sm btn-light-2" data-bs-toggle="dropdown"><i class="bi bi-three-dots"></i></button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item view-emp" href="#" data-id="${e.id}"><i class="bi bi-eye me-2"></i>View</a></li>
            <li><a class="dropdown-item" href="employee-profile.html?id=${e.id}"><i class="bi bi-person-badge me-2"></i>Full Profile</a></li>
            ${canManage ? `<li><a class="dropdown-item edit-emp" href="#" data-id="${e.id}"><i class="bi bi-pencil me-2"></i>Edit</a></li>` : ""}
            ${canManage ? `<li><a class="dropdown-item deactivate-emp" href="#" data-id="${e.id}"><i class="bi bi-slash-circle me-2"></i>${e.status === "Inactive" ? "Activate" : "Deactivate"}</a></li>` : ""}
            ${canDelete ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-danger delete-emp" href="#" data-id="${e.id}"><i class="bi bi-trash me-2"></i>Delete</a></li>` : ""}
          </ul>
        </div>
      </td>
    </tr>`).join("");

  renderPagination("empPagination", data.length, empState.perPage, empState.page, (p) => { empState.page = p; renderEmployeeTable(); });
  wireRowActions();
}

function wireRowActions() {
  document.querySelectorAll(".view-emp").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault();
    const emp = getEmployeeById(a.dataset.id);
    document.getElementById("viewEmployeeBody").innerHTML = `
      <div class="text-center mb-3">
        <img src="${emp.avatar}" class="avatar-lg mb-2" alt="${emp.name}">
        <h5 class="mb-0">${emp.name}</h5>
        <div class="text-muted-2" style="font-size:.85rem;">${emp.designation} · ${emp.department}</div>
        <div class="mt-2">${badgeStatus(emp.status)}</div>
      </div>
      <div class="border-top pt-3" style="border-color:var(--border-color)!important;">
        <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Employee ID</span><span class="fw-semibold">${emp.id}</span></div>
        <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Email</span><span class="fw-semibold">${emp.email}</span></div>
        <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Phone</span><span class="fw-semibold">${emp.phone}</span></div>
        <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Joining Date</span><span class="fw-semibold">${formatDateReadable(emp.joiningDate)}</span></div>
        <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Manager</span><span class="fw-semibold">${emp.manager}</span></div>
        <div class="d-flex justify-content-between py-1" style="font-size:.85rem;"><span class="text-muted-2">Work Location</span><span class="fw-semibold">${emp.workLocation}</span></div>
      </div>
      <a href="employee-profile.html?id=${emp.id}" class="btn btn-primary w-100 mt-3">Open Full Profile</a>`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("viewEmployeeModal")).show();
  }));

  document.querySelectorAll(".edit-emp").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault();
    const emp = getEmployeeById(a.dataset.id);
    document.getElementById("employeeModalTitle").textContent = "Edit Employee — " + emp.name;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("employeeModal")).show();
    showToast("Form pre-filled for editing (simulated).", "info");
  }));

  document.querySelectorAll(".deactivate-emp").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault();
    const emp = getEmployeeById(a.dataset.id);
    const newStatus = emp.status === "Inactive" ? "Active" : "Inactive";
    confirmAction(`${newStatus === "Inactive" ? "Deactivate" : "Activate"} ${emp.name}?`, `This will mark the employee as ${newStatus.toLowerCase()}.`, () => {
      emp.status = newStatus;
      showToast(`${emp.name} is now ${newStatus.toLowerCase()}.`, "success");
      renderEmployeeTable();
    });
  }));

  document.querySelectorAll(".delete-emp").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault();
    const emp = getEmployeeById(a.dataset.id);
    confirmAction("Delete this employee?", "This action cannot be undone. All associated records will remain for audit purposes.", () => {
      const idx = employees.findIndex(x => x.id === emp.id);
      if (idx > -1) employees.splice(idx, 1);
      showToast("Employee deleted successfully.", "danger");
      renderEmployeeTable();
    });
  }));
}

function saveNewEmployee(closeModal) {
  const form = document.getElementById("employeeForm");
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const inputs = form.querySelectorAll("input, select");
  const firstName = inputs[0].value, lastName = inputs[1].value;
  const newId = "EMP" + String(employees.length + 1).padStart(3, "0");
  const newEmp = {
    id: newId, name: `${firstName} ${lastName}`, firstName, lastName,
    designation: inputs[15] ? inputs[15].value : "New Hire", department: document.getElementById("formDept").value,
    email: inputs[7].value, phone: inputs[8].value, gender: "—", dob: "—", maritalStatus: "—", bloodGroup: "—",
    joiningDate: "2026-09-19", manager: document.getElementById("formManager").value || "—",
    employmentType: "Full-Time", workLocation: "Bengaluru HQ", status: "Active",
    avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 90)}.jpg`,
    city: "—", state: "—", country: "India", basic: 30000, hra: 12000, allowances: 4000, bonus: 0, deductions: 2200, tax: 900
  };
  newEmp.gross = newEmp.basic + newEmp.hra + newEmp.allowances + newEmp.bonus;
  newEmp.net = newEmp.gross - newEmp.deductions - newEmp.tax;
  employees.push(newEmp);
  showToast("Employee added successfully.", "success");
  renderEmployeeTable();
  if (closeModal) bootstrap.Modal.getInstance(document.getElementById("employeeModal")).hide();
  else form.reset();
}
