# 4. Frontend Architecture

## 4.1 Overview
The frontend is a **HTML Multi-Page Architecture (MPA)** built with **HTML5, CSS3, and Vanilla
JavaScript** — no frontend framework or build step. Each screen is its own server-served `.html`
page; navigation between screens is standard browser navigation, not client-side routing.

## 4.2 Frontend Technology
- **HTML5** — semantic markup for every page
- **CSS3** — page- and component-scoped stylesheets
- **Vanilla JavaScript** — native DOM APIs and plain `<script>` includes; no external UI framework

## 4.3 Architectural Pattern
The frontend keeps a simple, direct structure:

- **Pages**: Standalone HTML files under `pages/` (plus the top-level auth pages) map one-to-one to
  application screens (Dashboard, Projects, Test Suites, Test Cases, Test Runs, Defects, Reports,
  Profile).
- **Components**: Reusable HTML fragments (`header`, `sidebar`, `navbar`, `footer`, `modal`) shared
  across pages.
- **Services**: A single `js/api.js` module wraps all `fetch` calls to the REST API, centralizing
  auth headers, base URL, and error handling so page scripts never call `fetch` directly.

## 4.4 Folder Structure
```
frontend/
├── index.html
├── login.html
├── register.html
├── forgot-password.html
│
├── pages/
│   ├── dashboard.html
│   ├── projects.html
│   ├── test-suites.html
│   ├── test-cases.html
│   ├── test-runs.html
│   ├── defects.html
│   ├── reports.html
│   └── profile.html
│
├── components/
│   ├── header.html
│   ├── sidebar.html
│   ├── navbar.html
│   ├── footer.html
│   └── modal.html
│
├── css/
│   ├── style.css
│   ├── login.css
│   ├── dashboard.css
│   ├── pages.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── api.js
│   ├── dashboard.js
│   ├── projects.js
│   ├── testcases.js
│   ├── reports.js
│   └── utils.js
│
└── assets/
    ├── images/
    ├── icons/
    ├── fonts/
    └── logos/
```
- Top-level `.html` files (`index.html`, `login.html`, `register.html`, `forgot-password.html`) are
  the pre-authentication entry pages.
- `pages/` holds every post-authentication screen, including `dashboard.html` — there is a single
  copy of each page in the whole project (no duplicate `dashboard.html` at the root).
- `components/` holds reusable HTML fragments shared across pages.
- `css/` holds all stylesheets: `style.css` (global/shared), `login.css` (auth pages),
  `dashboard.css` (dashboard-specific), `pages.css` (shared styling for the `pages/` screens), and
  `responsive.css` (breakpoints/responsive rules).
- `js/` holds all Vanilla JavaScript: `app.js` (shared bootstrap/init logic), `auth.js`
  (login/session/guards), `api.js` (the `apiClient` service — see 4.6), and one page-controller
  script per screen (`dashboard.js`, `projects.js`, `testcases.js`, `reports.js`), plus `utils.js`
  for shared helpers.
- `assets/` holds static assets (images, icons, fonts, logos).

## 4.5 Navigation
- Navigation between screens is standard multi-page HTML navigation — regular links and
  `window.location` changes between `index.html`, `login.html`, and the pages under `pages/`. There
  is no client-side router and no single-page-app behavior.
- Each protected page's script checks for a valid JWT on load (via `auth.js`) before rendering
  content, redirecting to `login.html` if the check fails.

## 4.6 Communication with Backend
- All calls go through the single `apiClient` module in `js/api.js`, which:
  - Attaches the `Authorization: Bearer <token>` header
  - Centralizes the API base URL and environment config
  - Normalizes error responses into a consistent shape for UI display
  - Redirects to `login.html` on a `401` response

## 4.7 UI Structure by Module
| Module | Key Views |
|---|---|
| Auth | Login, Register, Forgot Password |
| Dashboard | Summary widgets, activity |
| Projects | Project List, Project Detail |
| Test Suites | Suite List, Suite Detail |
| Test Cases | Test Case List, Test Case Editor |
| Test Runs | Run Board, Run History |
| Defects | Defect List, Defect Detail |
| Reports | Trend Charts, Exports |
| Profile | Account/settings |

## 4.8 State Management
State is kept intentionally minimal: the current user, auth token, and current page's data are held
in plain JavaScript variables within each page's own script, with the auth token persisted in
browser storage so it survives page navigation. There is no shared client-side state store — each
page loads its own data from the API on load, which fits naturally with the multi-page navigation
model and avoids state-synchronization complexity that a single-page app would need.

## 4.9 Styling Approach
- Every stylesheet under `css/` is used by at least one page: `style.css` is loaded on every page
  for shared base styles (typography, layout, buttons, forms); `login.css` on the three auth pages;
  `dashboard.css` on `pages/dashboard.html`; `pages.css` on the remaining `pages/` screens; and
  `responsive.css` on every page for breakpoint rules.
- No CSS framework or preprocessor dependency — plain CSS3, keeping the codebase dependency-free.
