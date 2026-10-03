# NimbusHR — HRM/HRMS Dashboard

A complete, static (frontend-only, no backend) Human Resource Management System
dashboard built with **HTML, CSS, vanilla JavaScript, Bootstrap 5, AOS and
Chart.js**. It covers the full employee lifecycle — recruitment, onboarding,
attendance, leave, payroll, performance, documents, assets, expenses,
announcements and reports — with role-based navigation, permissions and UI.

All data is fictional demo data (Indian names, INR currency, dates around
September 2026) generated purely for UI/UX demonstration purposes. There is
no backend, database or authentication — this is a front-end prototype only.

---

## How to open it

This is a pure static site — there is nothing to install or build.

1. Unzip the folder.
2. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox,
   Safari) — either by double-clicking it or by serving the folder with any
   static file server (e.g. `npx serve .` or the VS Code "Live Server"
   extension).
3. Log in with any of the demo credentials below, or use the **Quick demo
   access** buttons on the login screen to jump straight into a role.

> Note: because the pages use `fetch`-free relative links and `localStorage`,
> opening `index.html` via `file://` works fine in most browsers. If your
> browser blocks local storage on `file://` URLs, serve the folder over
> `http://localhost` instead (e.g. `npx serve .`).

---

## Demo roles & quick access

The login page includes a **"Quick demo access"** grid — just click a role
to be signed in as that role's demo user immediately. Alternatively, use the
login form with any email/password (it's a static demo, so any input works)
and it will sign you in as an Employee by default.

| Role | Demo User | Employee ID |
|---|---|---|
| Employee | Aarav Sharma | EMP001 |
| Team Lead | Rahul Verma | EMP011 |
| Manager | Kavita Joshi | EMP010 |
| HR Executive | Priya Patel | EMP002 |
| HR Manager | Anjali Nair | EMP006 |
| Payroll Manager | Vikram Singh | EMP005 |
| Admin | Sanjay Gupta | EMP015 |
| Super Admin | Amitabh Sinha | EMP021 |

Switch roles at any time from the avatar dropdown in the top-right header
(this reloads the page so the sidebar, permissions and dashboard update for
the new role).

Switch color themes from the theme swatches in the header — the choice is
saved instantly and persists across pages (no reload needed).

---

## Project structure

```
hrm-dashboard/
├── index.html                 Login page (role switcher, demo access)
├── dashboard.html              Role-specific dashboard (6 variants)
├── employees.html               Employee directory, add/edit/deactivate
├── employee-profile.html        10-tab employee profile view
├── departments.html             Departments, Designations, Org Chart
├── attendance.html               Register, My Calendar, Shifts, Overtime
├── leave.html                    Dashboard, Apply, Requests, Types, Holidays
├── payroll.html                  Dashboard, Processing, Salary Structure, Tax
├── payslip.html                  Printable payslip with month selector
├── recruitment.html              Dashboard, Jobs, Candidates, Interviews, Offers
├── onboarding.html               New joiner checklists & progress
├── performance.html              Dashboard, Goals, Reviews
├── expenses.html                  Expense claims & approvals
├── asset-management.html          Asset inventory & assignment
├── documents.html                 Document repository
├── announcements.html             Announcements, Events, Birthdays
├── productivity.html              Tasks, Timesheet, WFH, Travel requests
├── reports.html                   Cross-module report center
├── settings.html                  Company settings, Users, Permissions, Audit Log
├── 404.html                       Standalone error page
├── README.md
└── assets/
    ├── css/
    │   ├── themes.css           4 CSS-variable theme palettes
    │   └── style.css            Full design system (layout, components, responsive)
    └── js/
        ├── data.js               Central fictional data layer (single source of truth)
        ├── components.js         Shared sidebar/header/KPI-card/table helpers
        ├── app.js                 Sidebar toggle, toasts, debounce, sort helpers
        └── *.js                   One file per page (dashboard.js, employees.js, ...)
```

### Architecture notes

- **No hardcoded repeated markup.** Every table, card grid, nav menu and
  dropdown is rendered from JavaScript arrays in `assets/js/data.js`.
- **One shared data layer.** All pages read from the same `data.js`, so
  actions like approving a leave request or assigning an asset are reflected
  consistently anywhere that data is shown, for the lifetime of the tab.
  Since there is no backend, changes reset on page refresh.
- **Role-based navigation & permissions.** The sidebar (`navigation` array)
  and a `permissions` map in `data.js` gate which pages, buttons and actions
  each of the 8 roles can see.
- **Reusable UI primitives** live in `components.js`: `kpiCard()`,
  `badgeStatus()`, `renderPagination()`, `confirmAction()`, `emptyState()`,
  and more — used consistently across every module.
- **4 built-in themes** (2 light, 2 dark) defined purely with CSS variables
  in `themes.css`, switchable instantly via a `data-theme` attribute.
- Buttons for actions that would need a real backend (CSV/Excel/PDF export,
  invite user, add leave type, etc.) show a toast explaining that the action
  "will be connected to a backend later" rather than faking a result.

---

## Tech stack

- HTML5 / CSS3 / vanilla JavaScript (ES6+, no framework, no build step)
- [Bootstrap 5.3.3](https://getbootstrap.com/) — layout, modals, forms
- [Bootstrap Icons 1.11.3](https://icons.getbootstrap.com/) & [Font Awesome 6.5.1](https://fontawesome.com/) — iconography
- [AOS 2.3.4](https://michalsnik.github.io/aos/) — on-scroll animation
- [Chart.js 4.4.4](https://www.chartjs.org/) — dashboard & payroll charts
- [Google Fonts — Inter](https://fonts.google.com/specimen/Inter)

All libraries are **bundled locally** under `assets/vendor/` — nothing is
loaded from a CDN, so the dashboard works fully offline with no internet
connection required at all (the only external calls are optional: employee
photos are pulled from `randomuser.me` for realism, and gracefully fall back
to a generated initials avatar if they can't load).

---

## Limitations (by design)

This is a **static UI prototype**, not a production application:

- No real authentication, API, or database — all data lives in JS arrays
  and resets on refresh.
- Export/PDF/print actions that would require server-side generation show a
  placeholder toast instead of producing a real file (Print does trigger the
  real browser print dialog, e.g. on the payslip page).
- File upload fields accept a file for UI purposes but nothing is actually
  stored or uploaded anywhere.
