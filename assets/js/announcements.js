/* ==========================================================================
   ANNOUNCEMENTS.JS
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const canManage = hasPermission("manage_announcements");
  renderPageHeader("pageHeaderMount", "Announcements &amp; Events", "Company news, events and celebrations.", "");

  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderAnnTab(btn.dataset.tab);
  }));

  document.getElementById("publishAnnBtn").addEventListener("click", () => {
    const form = document.getElementById("announceForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    announcements.unshift({
      title: document.getElementById("annTitle").value, description: document.getElementById("annDesc").value,
      author: getCurrentUser().name, publishedDate: "2026-09-19", audience: document.getElementById("annAudience").value, status: "Published"
    });
    showToast("Announcement published.", "success");
    bootstrap.Modal.getInstance(document.getElementById("announceModal")).hide();
    form.reset();
    renderAnnTab("announcements");
  });

  document.getElementById("saveEventBtn").addEventListener("click", () => {
    const form = document.getElementById("eventForm");
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const timeVal = document.getElementById("evTime").value;
    const [h, m] = timeVal.split(":");
    const hour12 = ((+h % 12) || 12) + ":" + m + " " + (+h >= 12 ? "PM" : "AM");
    events.unshift({
      name: document.getElementById("evName").value, date: document.getElementById("evDate").value, time: hour12,
      location: document.getElementById("evLocation").value, organizer: getCurrentUser().name, participants: 0, status: "Upcoming"
    });
    showToast("Event created.", "success");
    bootstrap.Modal.getInstance(document.getElementById("eventModal")).hide();
    form.reset();
    renderAnnTab("events");
  });

  renderAnnTab("announcements");
});

function renderAnnTab(tab) {
  const mount = document.getElementById("annTabContent");
  if (tab === "announcements") mount.innerHTML = announcementsHtml();
  else if (tab === "events") mount.innerHTML = eventsHtml();
  else if (tab === "birthdays") mount.innerHTML = birthdaysHtml();
}

/* ---------------------------------------------------------------------- */
/* ANNOUNCEMENTS                                                            */
/* ---------------------------------------------------------------------- */

function announcementsHtml() {
  const canManage = hasPermission("manage_announcements");
  return `
  <div class="d-flex justify-content-end mb-3 no-print">
    ${canManage ? `<button class="btn btn-primary btn-sm" onclick="bootstrap.Modal.getOrCreateInstance(document.getElementById('announceModal')).show()"><i class="bi bi-plus-lg me-1"></i>New Announcement</button>` : ""}
  </div>
  <div class="row g-3">
    ${announcements.length ? announcements.map(a => `
      <div class="col-12">
        <div class="hrm-card" data-aos="fade-up">
          <div class="hrm-card-body">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
              <div>
                <h6 class="mb-1">${a.title}</h6>
                <div style="font-size:.76rem;color:var(--text-muted);">By ${a.author} · ${formatDateReadable(a.publishedDate)} · Audience: ${a.audience}</div>
              </div>
              ${badgeStatus(a.status)}
            </div>
            <p class="mb-0" style="font-size:.86rem;">${a.description}</p>
          </div>
        </div>
      </div>`).join("") : `<div class="col-12">${emptyState("bi-megaphone", "No Announcements", "There are no announcements to show right now.")}</div>`}
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* EVENTS                                                                   */
/* ---------------------------------------------------------------------- */

function eventsHtml() {
  const canManage = hasPermission("manage_announcements");
  return `
  <div class="d-flex justify-content-end mb-3 no-print">
    ${canManage ? `<button class="btn btn-primary btn-sm" onclick="bootstrap.Modal.getOrCreateInstance(document.getElementById('eventModal')).show()"><i class="bi bi-plus-lg me-1"></i>Create Event</button>` : ""}
  </div>
  <div class="hrm-card"><div class="table-wrap"><table class="hrm-table">
    <thead><tr><th>Event</th><th>Date</th><th>Time</th><th>Location</th><th>Organizer</th><th>Participants</th><th>Status</th></tr></thead>
    <tbody>${events.length ? events.map(e => `<tr>
      <td class="cell-primary">${e.name}</td><td>${formatDateReadable(e.date)}</td><td>${e.time}</td><td>${e.location}</td><td>${e.organizer}</td><td>${e.participants}</td><td>${badgeStatus(e.status)}</td>
    </tr>`).join("") : `<tr><td colspan="7">${emptyState("bi-calendar-x", "No Events Scheduled", "There are no upcoming events at the moment.")}</td></tr>`}</tbody>
  </table></div></div>`;
}

/* ---------------------------------------------------------------------- */
/* BIRTHDAYS & ANNIVERSARIES                                                */
/* ---------------------------------------------------------------------- */

function birthdaysHtml() {
  return `
  <div class="row g-3">
    <div class="col-lg-4">
      <div class="hrm-card h-100">
        <div class="hrm-card-head"><i class="bi bi-cake2 me-1"></i>Birthdays Today</div>
        <div class="hrm-card-body">
          ${birthdaysToday.length ? birthdaysToday.map(b => `
            <div class="d-flex align-items-center gap-2 py-2" style="border-bottom:1px solid var(--border-color);">
              <img src="${b.avatar}" class="avatar-sm" alt="${b.name}"><div><div style="font-weight:600;font-size:.85rem;">${b.name}</div><div style="font-size:.74rem;color:var(--text-muted);">${b.designation}</div></div>
            </div>`).join("") : emptyState("bi-cake2", "No Birthdays Today", "No one on your team is celebrating today.")}
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card h-100">
        <div class="hrm-card-head"><i class="bi bi-calendar-heart me-1"></i>Upcoming Birthdays</div>
        <div class="hrm-card-body">
          ${upcomingBirthdays.map(b => `
            <div class="d-flex align-items-center justify-content-between gap-2 py-2" style="border-bottom:1px solid var(--border-color);">
              <div class="d-flex align-items-center gap-2"><img src="${b.avatar}" class="avatar-sm" alt="${b.name}"><span style="font-weight:600;font-size:.85rem;">${b.name}</span></div>
              <span style="font-size:.78rem;color:var(--text-muted);">${b.date}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="hrm-card h-100">
        <div class="hrm-card-head"><i class="bi bi-trophy me-1"></i>Work Anniversaries</div>
        <div class="hrm-card-body">
          ${workAnniversaries.map(w => `
            <div class="d-flex align-items-center justify-content-between gap-2 py-2" style="border-bottom:1px solid var(--border-color);">
              <div class="d-flex align-items-center gap-2"><img src="${w.avatar}" class="avatar-sm" alt="${w.name}"><span style="font-weight:600;font-size:.85rem;">${w.name}</span></div>
              <span style="font-size:.78rem;color:var(--text-muted);">${w.years} yrs · ${w.date}</span>
            </div>`).join("")}
        </div>
      </div>
    </div>
  </div>`;
}
