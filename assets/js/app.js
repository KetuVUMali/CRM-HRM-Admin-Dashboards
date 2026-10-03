/* ==========================================================================
   HRM DASHBOARD — APP INIT
   Sidebar toggle behaviour, toast helper, small shared utilities.
   Each page still calls its own <page>.js render functions.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initSidebarToggle();
  initToastHost();
  if (window.AOS) AOS.init({ duration: 450, once: true, offset: 40 });
});

/* ---------------------------------------------------------------------- */
/* AVATAR FALLBACK                                                          */
/* If an external avatar photo (randomuser.me) fails to load — e.g. no      */
/* internet access, or the network blocks it — swap it for a generated      */
/* initials avatar instead of a broken-image icon. Uses capturing phase     */
/* since "error" events on <img> don't bubble.                              */
/* ---------------------------------------------------------------------- */

const AVATAR_PALETTE = ["#0e7c66", "#1f3b73", "#a8672f", "#2a6fb0", "#b3790e", "#7d5ba6", "#c23b3b", "#1a8a5f"];

document.addEventListener("error", (e) => {
  const img = e.target;
  if (!img || img.tagName !== "IMG" || img.dataset.fallbackApplied) return;
  const isAvatar = ["avatar-img", "avatar-sm", "avatar-xs", "avatar-lg"].some(c => img.classList.contains(c)) || img.closest(".org-node");
  if (!isAvatar) return;
  img.dataset.fallbackApplied = "1";
  const name = img.getAttribute("alt") || "?";
  const initials = name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const bg = AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${bg}"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Arial,sans-serif" font-size="36" fill="#fff" font-weight="700">${initials}</text></svg>`;
  img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}, true);

function initSidebarToggle() {
  const shell = document.getElementById("appShell");
  if (!shell) return;

  // Desktop collapse (persisted)
  if (localStorage.getItem("hrmSidebarCollapsed") === "1") shell.classList.add("sidebar-collapsed");

  document.addEventListener("click", (e) => {
    if (e.target.closest("#sidebarCollapseBtn")) {
      shell.classList.toggle("sidebar-collapsed");
      localStorage.setItem("hrmSidebarCollapsed", shell.classList.contains("sidebar-collapsed") ? "1" : "0");
    }
    if (e.target.closest("#mobileSidebarBtn")) {
      shell.classList.add("sidebar-mobile-open");
    }
    if (e.target.closest(".sidebar-backdrop") || e.target.closest("#sidebarCloseBtn")) {
      shell.classList.remove("sidebar-mobile-open");
    }
  });

  // Close mobile sidebar automatically if resized to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) shell.classList.remove("sidebar-mobile-open");
  });
}

/* ---------------------------------------------------------------------- */
/* TOASTS                                                                   */
/* ---------------------------------------------------------------------- */

function initToastHost() {
  if (document.getElementById("toastHost")) return;
  const host = document.createElement("div");
  host.id = "toastHost";
  host.className = "toast-container position-fixed bottom-0 end-0 p-3";
  host.style.zIndex = 1080;
  document.body.appendChild(host);
}

function showToast(message, type) {
  type = type || "success";
  const icons = { success: "bi-check-circle-fill", danger: "bi-x-circle-fill", warning: "bi-exclamation-triangle-fill", info: "bi-info-circle-fill" };
  const colors = { success: "var(--success)", danger: "var(--danger)", warning: "var(--warning)", info: "var(--info)" };
  const host = document.getElementById("toastHost");
  const el = document.createElement("div");
  el.className = "toast align-items-center border-0";
  el.setAttribute("role", "alert");
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${icons[type]}" style="color:${colors[type]};font-size:1.05rem;"></i>
        <span style="font-size:.85rem;">${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-sm me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  host.appendChild(el);
  const toast = new bootstrap.Toast(el, { delay: 3200 });
  toast.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

/* ---------------------------------------------------------------------- */
/* SHARED UTILITIES                                                         */
/* ---------------------------------------------------------------------- */

function debounce(fn, wait) {
  let t;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait || 250); };
}

function sortByField(arr, field, dir) {
  const copy = [...arr];
  copy.sort((a, b) => {
    let va = a[field], vb = b[field];
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  });
  return copy;
}

function simulateLoading(mountId, rows, cols) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  let html = "";
  for (let r = 0; r < (rows || 5); r++) {
    html += `<tr>`;
    for (let c = 0; c < (cols || 5); c++) html += `<td><div class="skeleton" style="height:14px;width:${60 + Math.random() * 30}%;"></div></td>`;
    html += `</tr>`;
  }
  mount.innerHTML = html;
}

function qs(param) {
  return new URLSearchParams(window.location.search).get(param);
}
