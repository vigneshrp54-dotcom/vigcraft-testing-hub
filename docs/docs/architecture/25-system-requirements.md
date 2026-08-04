# 25. System Requirements

## 25.1 Purpose
This document defines the minimum runtime, tooling, and client requirements for developing, running,
and using VigCraft Testing Hub.

## 25.2 Backend Runtime Requirements
| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | **18 LTS** (v18.x) or later | Aligns with `@playwright/test` and modern `mysql2`/`express` support; v20 LTS is also supported |
| npm | 9.x or later | Bundled with Node.js 18+ |
| MySQL | **8.0** or later | Required for JSON column support and current default authentication plugin used by `mysql2` |

## 25.3 Automation Requirements
| Requirement | Minimum Version | Notes |
|---|---|---|
| Playwright | Latest version compatible with the pinned `@playwright/test` release | Browsers installed via `npx playwright install` |
| OS packages for browser automation | Per Playwright's supported OS list | Required on any machine/CI runner executing Playwright runs |

## 25.4 Development Environment
| Requirement | Recommendation |
|---|---|
| OS | Windows, macOS, or Linux — no OS-specific backend code |
| Code editor | Any; no framework-specific tooling required (plain HTML/CSS/JS + Node.js) |
| Git | 2.30+ |

## 25.5 Supported Browsers (Frontend)
Since the frontend is server-rendered HTML5/CSS3/Vanilla JavaScript (Section 4) with no framework
polyfill layer, supported browsers are defined directly as the last two major versions of each:

| Browser | Support Level |
|---|---|
| Google Chrome | Fully supported |
| Mozilla Firefox | Fully supported |
| Microsoft Edge (Chromium-based) | Fully supported |
| Safari (macOS/iOS) | Fully supported |
| Internet Explorer (any version) | **Not supported** |

## 25.6 Minimum Client Hardware/Network
- Any device capable of running a supported browser (Section 25.5).
- Stable internet connection to reach the hosted REST API; no offline mode in MVP.

## 25.7 Database Sizing (MVP Baseline)
- No fixed minimum instance size is mandated in this document; the actual provisioned MySQL instance
  size is an operational/deployment decision (Section 16), not an architectural requirement.
