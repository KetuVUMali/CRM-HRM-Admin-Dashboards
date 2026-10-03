/* ==========================================================================
   ASSETS-PAGE.JS  (Asset Management)
   ========================================================================== */

let astCounter = 1010;
const astState = { search: "", category: "", status: "", page: 1, perPage: 8 };
let assignTargetId = null;

document.addEventListener("DOMContentLoaded", () => {
  const canManage = hasPermission("manage_assets");
  renderPageHeader("pageHeaderMount", "Asset Management", "Track company assets, assignments and maintenance status.",
    canManage ? `<button class="btn btn-primary" id="addAssetBtn"><i class="bi bi-plus-lg me-1"></i>Add Asset</button>` : "");

  document.getElementById("newAssetCategory").innerHTML = assetCategories.map(c => `<option>${c}</option>`).join("");
  document.getElementById("assignEmp").innerHTML = employees.map(e => `<option>${e.name}</option>`).join("");

  renderKpis();

  document.getElementById("filterMount").innerHTML = `
    <div class="row g-2 align-items-end">
      <div class="col-md-4"><label class="form-label">Search</label><input class="form-control" id="astSearch" placeholder="Search asset, employee or serial no..."></div>
      <div class="col-md-3"><label class="form-label">Category</label><select class="form-select" id="astCategoryFilter"><option value="">All Categories</option>${assetCategories.map(c => `<option>${c}</option>`).join("")}</select></div>
      <div class="col-md-3"><label class="form-label">Status</label><select class="form-select" id="astStatusFilter"><option value="">All Status</option><option>Assigned</option><option>Available</option><option>Under Repair</option><option>Retired</option></select></div>
      <div class="col-md-2"><button class="btn btn-light-2 w-100" id="astReset">Reset</button></div>
    </div>`;

  document.getElementById("astSearch").addEventListener("input", debounce(e => { astState.search = e.target.value; astState.page = 1; renderAstTable(); }, 250));
  document.getElementById("astCategoryFilter").addEventListener("change", e => { astState.category = e.target.value; astState.page = 1; renderAstTable(); });
  document.getElementById("astStatusFilter").addEventListener("change", e => { astState.status = e.target.value; astState.page = 1; renderAstTable(); });
  document.getElementById("astReset").addEventListener("click", () => {
    astState.search = ""; astState.category = ""; astState.status = ""; astState.page = 1;
    document.getElementById("astSearch").value = ""; document.getElementById("astCategoryFilter").value = ""; document.getElementById("astStatusFilter").value = "";
    renderAstTable();
  });

  const addBtn = document.getElementById("addAssetBtn");
  if (addBtn) addBtn.addEventListener("click", () => bootstrap.Modal.getOrCreateInstance(document.getElementById("addAssetModal")).show());
  document.getElementById("saveNewAssetBtn").addEventListener("click", () => {
    const form = document.getElementById("addAssetForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    assets.unshift({
      assetId: `AST-${++astCounter}`, name: document.getElementById("newAssetName").value, category: document.getElementById("newAssetCategory").value,
      serialNumber: document.getElementById("newAssetSerial").value, assignedTo: null, assignedDate: null,
      condition: document.getElementById("newAssetCondition").value, status: "Available"
    });
    showToast("Asset added to inventory.", "success");
    bootstrap.Modal.getInstance(document.getElementById("addAssetModal")).hide();
    form.reset();
    renderKpis(); renderAstTable();
  });

  document.getElementById("confirmAssignBtn").addEventListener("click", () => {
    const asset = assets.find(a => a.assetId === assignTargetId);
    asset.assignedTo = document.getElementById("assignEmp").value;
    asset.assignedDate = document.getElementById("assignDate").value;
    asset.status = "Assigned";
    showToast(`${asset.name} assigned to ${asset.assignedTo}.`, "success");
    bootstrap.Modal.getInstance(document.getElementById("assignModal")).hide();
    renderKpis(); renderAstTable();
  });

  renderAstTable();
});

function renderKpis() {
  const total = assets.length, assigned = assets.filter(a => a.status === "Assigned").length,
    available = assets.filter(a => a.status === "Available").length, underRepair = assets.filter(a => a.status === "Under Repair").length;
  document.getElementById("kpiMount").innerHTML = `
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Assets", value: total, icon: "bi-boxes", tint: "brand" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Assigned", value: assigned, icon: "bi-person-check", tint: "success" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Available", value: available, icon: "bi-box-seam", tint: "info" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Under Repair", value: underRepair, icon: "bi-tools", tint: "warning" })}</div>
  `;
}

function getFilteredAssets() {
  const s = astState.search.toLowerCase();
  return assets.filter(a =>
    (!s || a.name.toLowerCase().includes(s) || (a.assignedTo || "").toLowerCase().includes(s) || a.serialNumber.toLowerCase().includes(s)) &&
    (!astState.category || a.category === astState.category) &&
    (!astState.status || a.status === astState.status)
  );
}

function renderAstTable() {
  const canManage = hasPermission("manage_assets");
  const tbody = document.getElementById("astTbody");
  const filtered = getFilteredAssets();
  const rows = paginate(filtered, astState.page, astState.perPage);

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9">${emptyState("bi-laptop", "No Assets Found", "There are no assets matching your filters.")}</td></tr>`;
  } else {
    tbody.innerHTML = rows.map(a => `<tr>
      <td class="cell-primary">${a.assetId}</td><td>${a.name}</td><td>${a.category}</td><td>${a.serialNumber}</td>
      <td>${a.assignedTo || "—"}</td><td>${a.assignedDate ? formatDateReadable(a.assignedDate) : "—"}</td>
      <td>${a.condition}</td><td>${badgeStatus(a.status)}</td>
      <td>${assetActionCell(a, canManage)}</td>
    </tr>`).join("");
  }
  renderPagination("astPagination", filtered.length, astState.perPage, astState.page, (p) => { astState.page = p; renderAstTable(); });
  wireAstActions();
}

function assetActionCell(a, canManage) {
  if (!canManage) return `<span class="text-muted-2" style="font-size:.78rem;">—</span>`;
  if (a.status === "Available") return `<button class="btn btn-sm btn-outline-brand" data-assign="${a.assetId}"><i class="bi bi-person-plus me-1"></i>Assign</button>`;
  if (a.status === "Assigned") return `<button class="btn btn-sm btn-light-2" data-unassign="${a.assetId}">Unassign</button>`;
  if (a.status === "Under Repair") return `<button class="btn btn-sm btn-light-2" data-repaired="${a.assetId}">Mark Repaired</button>`;
  return `<span class="text-muted-2" style="font-size:.78rem;">Retired</span>`;
}

function wireAstActions() {
  document.querySelectorAll("[data-assign]").forEach(btn => btn.addEventListener("click", () => {
    assignTargetId = btn.dataset.assign;
    document.getElementById("assignModalTitle").textContent = `Assign ${assets.find(a => a.assetId === assignTargetId).name}`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("assignModal")).show();
  }));
  document.querySelectorAll("[data-unassign]").forEach(btn => btn.addEventListener("click", () => {
    const a = assets.find(x => x.assetId === btn.dataset.unassign);
    confirmAction("Unassign Asset?", `Unassign ${a.name} from ${a.assignedTo}?`, () => {
      a.assignedTo = null; a.assignedDate = null; a.status = "Available";
      showToast("Asset unassigned and marked available.", "success"); renderKpis(); renderAstTable();
    });
  }));
  document.querySelectorAll("[data-repaired]").forEach(btn => btn.addEventListener("click", () => {
    const a = assets.find(x => x.assetId === btn.dataset.repaired);
    a.status = "Available"; a.condition = "Good";
    showToast(`${a.name} marked as repaired and available.`, "success"); renderKpis(); renderAstTable();
  }));
}
