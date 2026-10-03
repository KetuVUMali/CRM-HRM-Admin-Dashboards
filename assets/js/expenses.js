/* ==========================================================================
   EXPENSES.JS
   ========================================================================== */

let expCounter = 3307;
const expState = { search: "", category: "", status: "", page: 1, perPage: 8 };

document.addEventListener("DOMContentLoaded", () => {
  const canSubmit = hasPermission("submit_expense");
  renderPageHeader("pageHeaderMount", "Expense Claims", "Submit, track and approve employee expense reimbursements.",
    canSubmit ? `<button class="btn btn-primary" id="addExpBtn"><i class="bi bi-plus-lg me-1"></i>Submit Expense Claim</button>` : "");

  document.getElementById("expCategory").innerHTML = expenseCategories.map(c => `<option>${c}</option>`).join("");

  renderKpis();

  document.getElementById("filterMount").innerHTML = `
    <div class="row g-2 align-items-end">
      <div class="col-md-4"><label class="form-label">Search</label><input class="form-control" id="expSearch" placeholder="Search employee or description..."></div>
      <div class="col-md-3"><label class="form-label">Category</label><select class="form-select" id="expCategoryFilter"><option value="">All Categories</option>${expenseCategories.map(c => `<option>${c}</option>`).join("")}</select></div>
      <div class="col-md-3"><label class="form-label">Status</label><select class="form-select" id="expStatusFilter"><option value="">All Status</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Reimbursed</option></select></div>
      <div class="col-md-2"><button class="btn btn-light-2 w-100" id="expReset">Reset</button></div>
    </div>`;

  document.getElementById("expSearch").addEventListener("input", debounce(e => { expState.search = e.target.value; expState.page = 1; renderExpTable(); }, 250));
  document.getElementById("expCategoryFilter").addEventListener("change", e => { expState.category = e.target.value; expState.page = 1; renderExpTable(); });
  document.getElementById("expStatusFilter").addEventListener("change", e => { expState.status = e.target.value; expState.page = 1; renderExpTable(); });
  document.getElementById("expReset").addEventListener("click", () => {
    expState.search = ""; expState.category = ""; expState.status = ""; expState.page = 1;
    document.getElementById("expSearch").value = ""; document.getElementById("expCategoryFilter").value = ""; document.getElementById("expStatusFilter").value = "";
    renderExpTable();
  });

  const addBtn = document.getElementById("addExpBtn");
  if (addBtn) addBtn.addEventListener("click", () => bootstrap.Modal.getOrCreateInstance(document.getElementById("expenseModal")).show());
  document.getElementById("saveExpenseBtn").addEventListener("click", () => {
    const form = document.getElementById("expenseForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const user = getCurrentUser();
    expenses.unshift({
      id: `EXP-${++expCounter}`, employee: user.name, avatar: user.avatar,
      category: document.getElementById("expCategory").value, date: document.getElementById("expDate").value,
      amount: Number(document.getElementById("expAmount").value), description: document.getElementById("expDesc").value,
      receipt: document.getElementById("expReceipt").value ? document.getElementById("expReceipt").value.split(/[\\/]/).pop() : "no_receipt.pdf",
      status: "Pending"
    });
    showToast("Expense claim submitted successfully.", "success");
    bootstrap.Modal.getInstance(document.getElementById("expenseModal")).hide();
    form.reset();
    document.getElementById("expDate").value = "2026-09-19";
    renderKpis();
    renderExpTable();
  });

  renderExpTable();
});

function renderKpis() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === "Pending").reduce((s, e) => s + e.amount, 0);
  const approved = expenses.filter(e => e.status === "Approved").reduce((s, e) => s + e.amount, 0);
  const reimbursed = expenses.filter(e => e.status === "Reimbursed").reduce((s, e) => s + e.amount, 0);
  document.getElementById("kpiMount").innerHTML = `
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Claims", value: formatINR(total), icon: "bi-wallet2", tint: "brand" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Pending Approval", value: formatINR(pending), icon: "bi-hourglass-split", tint: "warning" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Approved", value: formatINR(approved), icon: "bi-check-circle", tint: "success" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Reimbursed", value: formatINR(reimbursed), icon: "bi-cash-coin", tint: "info" })}</div>
  `;
}

function getFilteredExpenses() {
  const s = expState.search.toLowerCase();
  return expenses.filter(e =>
    (!s || e.employee.toLowerCase().includes(s) || e.description.toLowerCase().includes(s)) &&
    (!expState.category || e.category === expState.category) &&
    (!expState.status || e.status === expState.status)
  );
}

function renderExpTable() {
  const canApprove = hasPermission("approve_team_leave") || hasPermission("manage_employees");
  const tbody = document.getElementById("expTbody");
  const filtered = getFilteredExpenses();
  const rows = paginate(filtered, expState.page, expState.perPage);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9">${emptyState("bi-wallet2", "No Expense Claims Found", "There are no expense claims matching your filters.")}</td></tr>`;
  } else {
    tbody.innerHTML = rows.map(e => `<tr>
      <td class="cell-primary">${e.id}</td><td>${avatarNameCell(e.avatar, e.employee)}</td><td>${e.category}</td>
      <td>${formatDateReadable(e.date)}</td><td class="num">${formatINR(e.amount)}</td>
      <td style="max-width:200px;">${e.description}</td>
      <td><i class="bi bi-paperclip me-1"></i><span style="font-size:.78rem;color:var(--text-muted);">${e.receipt}</span></td>
      <td>${badgeStatus(e.status)}</td>
      <td>${expActionCell(e, canApprove)}</td>
    </tr>`).join("");
  }
  renderPagination("expPagination", filtered.length, expState.perPage, expState.page, (p) => { expState.page = p; renderExpTable(); });
  wireExpActions();
}

function expActionCell(e, canApprove) {
  if (!canApprove) return `<span class="text-muted-2" style="font-size:.78rem;">—</span>`;
  if (e.status === "Pending") return `<button class="btn btn-sm btn-outline-success me-1" data-approve="${e.id}"><i class="bi bi-check-lg"></i></button><button class="btn btn-sm btn-outline-danger" data-reject="${e.id}"><i class="bi bi-x-lg"></i></button>`;
  if (e.status === "Approved") return `<button class="btn btn-sm btn-light-2" data-reimburse="${e.id}">Mark Reimbursed</button>`;
  return `<span class="text-muted-2" style="font-size:.78rem;">No action needed</span>`;
}

function wireExpActions() {
  document.querySelectorAll("[data-approve]").forEach(btn => btn.addEventListener("click", () => {
    const e = expenses.find(x => x.id === btn.dataset.approve);
    confirmAction("Approve Expense Claim?", `Approve ${formatINR(e.amount)} claim from ${e.employee}?`, () => { e.status = "Approved"; showToast("Expense claim approved.", "success"); renderKpis(); renderExpTable(); });
  }));
  document.querySelectorAll("[data-reject]").forEach(btn => btn.addEventListener("click", () => {
    const e = expenses.find(x => x.id === btn.dataset.reject);
    confirmAction("Reject Expense Claim?", `Reject ${formatINR(e.amount)} claim from ${e.employee}?`, () => { e.status = "Rejected"; showToast("Expense claim rejected.", "danger"); renderKpis(); renderExpTable(); });
  }));
  document.querySelectorAll("[data-reimburse]").forEach(btn => btn.addEventListener("click", () => {
    const e = expenses.find(x => x.id === btn.dataset.reimburse);
    e.status = "Reimbursed"; showToast("Expense marked as reimbursed.", "success"); renderKpis(); renderExpTable();
  }));
}
