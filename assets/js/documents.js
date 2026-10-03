/* ==========================================================================
   DOCUMENTS.JS
   ========================================================================== */

const docState = { search: "", category: "" };
const docCategories = ["Employee Documents", "Policies", "Contracts", "Payroll Documents", "Company Documents"];

document.addEventListener("DOMContentLoaded", () => {
  const canManage = hasPermission("manage_documents");
  renderPageHeader("pageHeaderMount", "Documents", "Company policies, contracts and employee records in one place.",
    canManage ? `<button class="btn btn-primary" id="uploadDocBtn"><i class="bi bi-upload me-1"></i>Upload Document</button>` : "");

  renderKpis();

  document.getElementById("filterMount").innerHTML = `
    <div class="row g-2 align-items-end">
      <div class="col-md-6"><label class="form-label">Search</label><input class="form-control" id="docSearch" placeholder="Search document name or owner..."></div>
      <div class="col-md-4"><label class="form-label">Category</label><select class="form-select" id="docCategoryFilter"><option value="">All Categories</option>${docCategories.map(c => `<option>${c}</option>`).join("")}</select></div>
      <div class="col-md-2"><button class="btn btn-light-2 w-100" id="docReset">Reset</button></div>
    </div>`;

  document.getElementById("docSearch").addEventListener("input", debounce(e => { docState.search = e.target.value; renderDocsGrid(); }, 250));
  document.getElementById("docCategoryFilter").addEventListener("change", e => { docState.category = e.target.value; renderDocsGrid(); });
  document.getElementById("docReset").addEventListener("click", () => {
    docState.search = ""; docState.category = "";
    document.getElementById("docSearch").value = ""; document.getElementById("docCategoryFilter").value = "";
    renderDocsGrid();
  });

  const uploadBtn = document.getElementById("uploadDocBtn");
  if (uploadBtn) uploadBtn.addEventListener("click", () => bootstrap.Modal.getOrCreateInstance(document.getElementById("uploadDocModal")).show());
  document.getElementById("saveDocBtn").addEventListener("click", () => {
    const form = document.getElementById("uploadDocForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fileVal = document.getElementById("docFile").value;
    documents.unshift({
      name: document.getElementById("docName").value || fileVal.split(/[\\/]/).pop(),
      category: document.getElementById("docCategory").value, owner: getCurrentUser().name,
      uploadedDate: "2026-09-19", expiryDate: document.getElementById("docExpiry").value || "—", status: "Draft"
    });
    showToast("Document uploaded successfully.", "success");
    bootstrap.Modal.getInstance(document.getElementById("uploadDocModal")).hide();
    form.reset();
    renderKpis(); renderDocsGrid();
  });

  renderDocsGrid();
});

function renderKpis() {
  const total = documents.length;
  const verified = documents.filter(d => ["Verified", "Published", "Active"].includes(d.status)).length;
  const expiring = documents.filter(d => d.expiryDate !== "—" && new Date(d.expiryDate) < new Date("2027-06-01")).length;
  const draft = documents.filter(d => d.status === "Draft").length;
  document.getElementById("kpiMount").innerHTML = `
    <div class="col-6 col-lg-3">${kpiCard({ label: "Total Documents", value: total, icon: "bi-folder2-open", tint: "brand" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Verified / Active", value: verified, icon: "bi-patch-check", tint: "success" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Expiring Soon", value: expiring, icon: "bi-clock-history", tint: "warning" })}</div>
    <div class="col-6 col-lg-3">${kpiCard({ label: "Drafts", value: draft, icon: "bi-file-earmark-text", tint: "info" })}</div>
  `;
}

function renderDocsGrid() {
  const s = docState.search.toLowerCase();
  const filtered = documents.filter(d => (!s || d.name.toLowerCase().includes(s) || d.owner.toLowerCase().includes(s)) && (!docState.category || d.category === docState.category));
  const mount = document.getElementById("docsGrid");
  if (!filtered.length) {
    mount.innerHTML = `<div class="col-12">${emptyState("bi-folder-x", "No Documents Found", "There are no documents matching your search.")}</div>`;
    return;
  }
  mount.innerHTML = filtered.map(d => docCardHtml(d)).join("");
}
