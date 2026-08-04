# 17. Environment Configuration

## 17.1 Configuration Strategy
All environment-specific values are externalized via environment variables, loaded through `.env`
files per environment and never hardcoded or committed to source control (`.env` is gitignored;
`.env.example` documents required keys).

## 17.2 Required Environment Variables (Indicative)

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` \| `staging` \| `production` |
| `PORT` | API server port |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_POOL_MIN` / `DB_POOL_MAX` | Connection pool sizing |
| `JWT_SECRET` | Access token signing secret |
| `JWT_ACCESS_EXPIRY` | Access token TTL (e.g., `15m`) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_REFRESH_EXPIRY` | Refresh token TTL (e.g., `7d`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allow-list |
| `LOG_LEVEL` | `debug` \| `info` \| `warn` \| `error` |
| `AUTOMATION_REPORT_PATH` | File path for Playwright report storage |
| `AUTOMATION_RUN_CONCURRENCY` | Max concurrent Playwright runs |

## 17.3 Per-Environment Overrides
| Setting | Development | Staging | Production |
|---|---|---|---|
| `LOG_LEVEL` | debug | info | warn |
| `DB_POOL_MAX` | small (e.g., 5) | medium (e.g., 10) | tuned to load (e.g., 20+) |
| `JWT_ACCESS_EXPIRY` | longer for dev convenience | standard | standard/short |
| HTTPS enforcement | optional | required | required |
| CORS origins | localhost | staging domain | production domain only |

## 17.4 Secrets Management
- MVP: environment variables injected via deployment platform's secret store (not committed files).
- Future phase: dedicated secrets manager (e.g., Vault/cloud provider secret manager) — see Section
  23.

## 17.5 Configuration Loading
- A single `config/index.js` module reads and validates required environment variables at
  application startup, **failing fast** (process exits with a clear error) if a required variable is
  missing — preventing silently misconfigured deployments.
