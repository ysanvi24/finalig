# 🛡️ VNIT IG App — Bulletproof QA Strategy V2
## शाश्वतम् Quality Assurance — Complete Error Detection & Optimization Guide

---

## 📊 Executive Summary

| Metric | V1 (Original) | V2 (Current) |
|--------|:---:|:---:|
| **Error Matrix Tests** | 52 ✅ | **76 ✅ (+46%)** |
| **Test Categories** | 4 | **5** (+ Events Regression) |
| **API Endpoints Tested** | 2 | **13 (all mounts)** |
| **Production Readiness** | 14/14 | 14/14 ✅ |
| **Bundle Size** | 626 KB | Within 2MB budget ✅ |
| **Sports Registry** | 10 hardcoded | **82 dynamic (21 match + 61 event)** |
| **CI Pipeline Jobs** | 5 | **5 (enhanced)** |
| **A11y Pages Audited** | 6 (2 stale) | **5 (all valid routes)** |

---

## 1. 🎯 Tool Configuration & Setup

### 1A. Sentry — Real-Time Error Monitoring

#### Frontend (`client/src/lib/sentry.js`)

| Feature | Configuration | Purpose |
|---------|:---:|---------|
| **Browser Tracing** | React Router v6 integration | Track page navigation + API call durations |
| **Session Replay** | 10% sessions / 100% on error | "DVR for bugs" — replay user actions before crash |
| **Error Filtering** | `ignoreErrors` + `denyUrls` | Suppress ResizeObserver, browser extensions, network noise |
| **Context Tags** | `section`, `theme`, `page`, `viewport` | Every error carries admin/public section, active theme, screen size |
| **Socket State** | `window.__SOCKET_CONNECTED` in `event.extra` | Know if live scoreboard was connected when error occurred |
| **Breadcrumbs** | API endpoint extraction | Each fetch/XHR includes extracted route name (e.g., "matches/create") |

**Key config values:**
```
tracesSampleRate: 0.2     (20% of transactions sampled)
replaysSessionSampleRate: 0.1  (10% of sessions recorded)
replaysOnErrorSampleRate: 1.0  (100% of errored sessions recorded)
```

#### Backend (`server/instrument.js`)

| Feature | Configuration | Purpose |
|---------|:---:|---------|
| **Express Integration** | `expressIntegration()` | Auto-instruments middleware stack timing |
| **Mongo Integration** | `mongoIntegration()` | Track MongoDB query performance |
| **HTTP Integration** | `httpIntegration()` | Track outbound HTTP calls |
| **Error Classification** | `beforeSend` filter | Only programming errors → Sentry; operational errors (4xx, expired JWT) discarded |
| **Profile Sampling** | 10% of traces | CPU profiling for hot paths |

**Operational errors filtered OUT of Sentry:**
- `TokenExpiredError` (expected: user needs to re-login)
- `CORS` errors (misconfigured clients, not bugs)
- `ECONNRESET` (network interruptions)
- Any error with `isOperational: true`

#### Setup (2 env vars):
```bash
# Frontend (.env in client/)
VITE_SENTRY_DSN=https://<key>@sentry.io/<project-id>

# Backend (.env in server/)
SENTRY_DSN=https://<key>@sentry.io/<project-id>
```

#### Integration Points:

| File | Integration |
|------|-------------|
| `client/src/main.jsx` | `initSentry()` before React render, global `unhandledrejection` → `Sentry.captureException()` |
| `client/src/components/ErrorBoundary.jsx` | `componentDidCatch` → lazy-loads Sentry, reports with `componentStack` context |
| `client/src/socket.js` | Tracks `window.__SOCKET_CONNECTED` for Sentry context |
| `server/server.js` | `require('./instrument')` as FIRST line, `Sentry.setupExpressErrorHandler()` |
| `server/middleware/errorHandler.js` | Programming errors → `Sentry.captureException()`, operational errors → JSON response only |

---

### 1B. Lighthouse CI — Performance Budgets

#### Configuration (`.lighthouserc.js`)

| Setting | Value | Rationale |
|---------|:---:|---------|
| **Pages Audited** | 4 URLs: /, /leaderboard, /highlights, /about | Core user journeys |
| **Runs per page** | 3 (median reported) | Smooths variance |
| **Network** | 150ms RTT, 1.6 Mbps | VNIT campus WiFi simulation |
| **CPU** | 2× slowdown | Mid-tier Android phone |

#### Performance Budgets:

| Metric | Budget | Severity | What it catches |
|--------|:---:|:---:|---------|
| First Contentful Paint | < 3,000ms | warn | Slow initial render |
| Largest Contentful Paint | < 4,000ms | warn | Hero image/content blocked |
| Cumulative Layout Shift | < 0.1 | **error** | Layout shifts (Framer Motion, fonts) |
| Total Blocking Time | < 600ms | warn | Heavy JS execution |
| Time to Interactive | < 5,000ms | warn | Page unresponsive too long |
| Speed Index | < 4,500ms | warn | Perceived slowness |
| Accessibility Score | ≥ 85% | **error** | WCAG violations |
| SEO Score | ≥ 85% | warn | Missing meta, bad structure |
| DOM Elements | < 1,500 | warn | DOM bloat |

#### Running locally:
```bash
npx lhci autorun
```

---

### 1C. GTmetrix — External Performance Validation

GTmetrix complements Lighthouse by testing from **real external servers** (not localhost):

| Step | Action |
|------|--------|
| 1 | Deploy to Railway/Render staging |
| 2 | Test URL: `https://your-staging-url.up.railway.app` |
| 3 | Settings: Dulles VA server, Chrome, unthrottled |
| 4 | Track: TTFB, LCP, TBT, CLS |
| 5 | Compare against Lighthouse local budgets |

**GTmetrix-specific catches:**
- CDN latency (Railway/Render cold starts)
- Real SSL negotiation time
- DNS resolution delays
- Geographic performance variation

---

### 1D. Screaming Frog SEO Spider — Structural Integrity

**Why needed:** SPA (React Router) renders all pages client-side. Screaming Frog crawls the rendered DOM to verify:

| Check | Target | Current Status |
|-------|--------|:---:|
| Broken internal links | 0 | Verify after Events expansion |
| Missing `<title>` | 0 | ✅ Set in index.html |
| Missing meta descriptions | 0 per page | ✅ OG tags present |
| `<h1>` per page | Exactly 1 | Verify per route |
| Redirect chains | 0 | Check `/match/:id` ↔ `/matches/:id` |
| Canonical consistency | All pages | ✅ Canonical set |
| JSON-LD validation | Valid schema | ✅ SportsEvent schema |
| Image alt attributes | 100% coverage | Audit Three.js canvas exclusion |

**Configuration for SPA:**
```
Mode: JavaScript Rendering
Wait: 5 seconds (Framer Motion settle)
Crawl: https://your-domain.com
Max pages: 50
```

---

### 1E. WAVE / axe-core — Accessibility

#### Automated Audit (`qa/accessibility-audit.js`)

**Pages audited (V2 — corrected):**
| Page | Path | Status |
|------|------|:---:|
| Home | `/` | ✅ |
| Leaderboard | `/leaderboard` | ✅ |
| Events | `/events` | ✅ **NEW** |
| Student Council | `/student-council` | ✅ |
| About | `/about` | ✅ |

*Removed stale routes: `/schedule`, `/highlights` (no longer public routes)*

**Dual engine approach:**
1. **pa11y** — WCAG 2.1 AA compliance (rule-based)
2. **axe-core** — Deep violation analysis with impact severity (critical/serious/moderate)

**Known exclusions:**
- `WCAG2AA.Principle1.Guideline1_1.1_1_1.H67.2` — Three.js `<canvas>` (no text alternative expected)

```bash
# Full audit
node qa/accessibility-audit.js

# Single page
node qa/accessibility-audit.js --url=http://localhost:5173/events
```

---

### 1F. BrowserStack / Chrome DevTools — Cross-Browser Testing

#### Priority Test Matrix:

| Browser | Version | Devices | Priority |
|---------|---------|---------|:---:|
| Chrome Mobile | 120+ | Samsung A14, Pixel 7 | 🔴 P0 |
| Chrome Desktop | 120+ | 1920×1080 | 🔴 P0 |
| Safari iOS | 16+ | iPhone 13, iPhone 15 | 🔴 P0 |
| Firefox | 120+ | Desktop | 🟡 P1 |
| Samsung Internet | Latest | Galaxy phones | 🟡 P1 |
| Edge | Latest | Desktop | 🟢 P2 |

**App-specific test scenarios:**
| Scenario | What to verify | Critical? |
|----------|----------------|:---:|
| Three.js canvas on mobile | WebGL renders, no crash, no blank | 🔴 Yes |
| Framer Motion on low-end device | No jank, CLS < 0.1 | 🔴 Yes |
| Live scoreboard over unstable WiFi | Socket.io reconnects, no stale data | 🔴 Yes |
| Theme switching | All 3 themes render correctly | 🟡 |
| Events page scroll | 80+ sport cards render smoothly | 🟡 |
| Admin panel on tablet | All CRUD operations work | 🟡 |

**Chrome DevTools Workflow:**
```
1. Performance tab → Record page load
   Target: No layout shifts > 0.1, no long tasks > 200ms

2. Network tab → Slow 3G preset
   Target: All API calls < 5s, images < 2MB

3. Application tab → Storage
   Target: Service worker registered, manifest valid

4. Lighthouse tab → Full audit
   Target: Performance > 70, a11y > 85, SEO > 85
```

---

## 2. 📋 Ultimate Error Matrix — 76 Tests in 5 Categories

### Category 1: Runtime & Logic Errors (22 tests)

| # | Test | Severity | What it catches |
|---|------|:---:|---------|
| 1.1 | Backend `/alive` responds | 🔴 | Server down, port conflict |
| 1.2 | `/api/health` detailed status | 🔴 | Health check missing |
| 1.3 | Structured error responses | 🔴 | Stack trace leaks to users |
| 1.4 | 404 on unknown routes | 🔴 | Express crash on bad routes |
| 1.5 | **All 13 API mounts respond** | 🔴 | Any route mount failing |
| 1.6 | Rate limiter on `/api/auth` | 🟡 | DDoS/brute-force vulnerability |
| 1.7 | MongoDB connected | 🔴 | Database connection failure |
| 1.8 | Socket.io polling handshake | 🔴 | WebSocket server failure |
| 1.9 | **Events API paginated response** | 🔴 | Events CRUD broken |
| 1.10 | **Events search/filter** | 🟡 | Query param handling crash |
| 1.11 | **Leaderboard returns ranked data** | 🔴 | Leaderboard aggregation broken |
| 1.12 | ErrorBoundary exists | 🔴 | React white screen of death |
| 1.13 | Sentry frontend | 🔴 | Production errors invisible |
| 1.14 | Sentry backend | 🔴 | Server bugs invisible |
| 1.15 | Global error handlers | 🔴 | Unhandled promise rejections |
| 1.16 | Graceful shutdown | 🔴 | Zombie processes |
| 1.17 | asyncWrap utility | 🔴 | Async errors crash Express |
| 1.18 | **Auth rejects bad credentials** | 🔴 | Auth bypass vulnerability |
| 1.19 | **Protected endpoints reject unauth** | 🔴 | Authorization bypass |
| 1.20 | **Highlights API responds** | 🟡 | Highlights endpoint crash |
| 1.21 | **Student council API** | 🟡 | Student council endpoint crash |
| 1.22 | **About API responds** | 🟡 | About endpoint crash |

### Category 2: Performance & Core Web Vitals (14 tests)

| # | Test | Severity | What it catches |
|---|------|:---:|---------|
| 2.1 | API < 2s (matches) | 🔴 | Slow DB queries |
| 2.2 | **Events API < 2s** | 🔴 | Events query performance |
| 2.3 | **Leaderboard API < 2s** | 🔴 | Aggregation pipeline slow |
| 2.4 | Optimized chunks exist | 🔴 | Build failure |
| 2.5 | Manual chunks configured | 🔴 | Single massive bundle |
| 2.6 | Hidden source maps | 🔴 | Source maps shipped to browser |
| 2.7 | Console stripped (terser) | 🟡 | console.log in production |
| 2.8 | Web Vitals tracked | 🔴 | Blind to real performance |
| 2.9 | CSS code splitting | 🟡 | Unused CSS loaded |
| 2.10 | No oversized images | 🟡 | Slow page loads |
| 2.11 | MongoDB config | 🔴 | Connection string missing |
| 2.12 | Caching middleware | 🟡 | Redundant DB queries |
| 2.13 | Three.js code-split | 🔴 | 180KB blocking main bundle |
| 2.14 | **Bundle < 2MB budget** | 🔴 | Bundle too large for campus WiFi |

### Category 3: Structural & SEO Integrity (16 tests)

| # | Test | Severity | What it catches |
|---|------|:---:|---------|
| 3.1 | Meta tags present | 🔴 | Missing viewport/description |
| 3.2 | theme-color `#110a28` | 🟡 | Wrong mobile address bar color |
| 3.3 | Open Graph tags | 🟡 | Broken social sharing |
| 3.4 | JSON-LD structured data | 🟡 | No rich results in Google |
| 3.5 | Canonical URL | 🟡 | Duplicate content penalty |
| 3.6 | PWA manifest | 🟡 | Add-to-homescreen fails |
| 3.7 | SPA fallback | 🔴 | 404 on direct URL navigation |
| 3.8 | Nginx config | 🟡 | Static serving misconfigured |
| 3.9 | Dockerfiles valid | 🔴 | Deployment failure |
| 3.10 | Deploy configs present | 🔴 | Railway/Render deployment fails |
| 3.11 | Helmet headers | 🔴 | XSS/clickjacking |
| 3.12 | .env in .gitignore | 🔴 | API keys in source control |
| 3.13 | No hardcoded localhost | 🔴 | Production hits localhost |
| 3.14 | **Vercel config for SPA** | 🟡 | Client-side routing breaks on Vercel |
| 3.15 | **All routes in App.jsx** | 🔴 | Missing public pages |
| 3.16 | **ErrorBoundary wraps routes** | 🔴 | Uncaught errors white-screen entire app |

### Category 4: Accessibility & Cross-Browser (14 tests)

| # | Test | Severity | What it catches |
|---|------|:---:|---------|
| 4.1 | HTML `lang="en"` | 🔴 | Screen readers fail language detection |
| 4.2 | Viewport (no zoom-disable) | 🔴 | WCAG 1.4.4 violation |
| 4.3 | Touch targets 44px | 🟡 | Unclickable on mobile |
| 4.4 | CSS variables for contrast | 🟡 | Text invisible on background |
| 4.5 | Font loading strategy | ⚠️ | FOUT/FOIT flash |
| 4.6 | prefers-reduced-motion | 🔴 | Seizure risk from animations |
| 4.7 | Mobile CSS exists | 🔴 | No mobile optimization |
| 4.8 | Tailwind responsive | 🔴 | Missing breakpoints |
| 4.9 | DaisyUI themes | 🔴 | Theme system broken |
| 4.10 | ErrorBoundary inline styles | 🔴 | Crash page fails without CSS |
| 4.11 | **3-theme system** | 🟡 | Theme missing from CSS |
| 4.12 | **Events in PublicNavbar** | 🔴 | Users can't find Events page |
| 4.13 | **Events in AdminLayout** | 🔴 | Admins can't manage Events |
| 4.14 | **Capacitor config** | ⚠️ | Mobile app builds fail |

### Category 5: Events Expansion Regression (10 tests) **🆕**

| # | Test | Severity | What it catches |
|---|------|:---:|---------|
| 5.1 | Server sportsRegistry.js | 🔴 | Registry file missing |
| 5.2 | Client sportsRegistry.js | 🔴 | Client registry missing |
| 5.3 | 21+ match / 55+ event sports | 🔴 | Registry truncated/corrupted |
| 5.4 | No CHESS self-alias | 🔴 | CHESS leaks into match sports |
| 5.5 | Event model exists | 🔴 | Event schema missing |
| 5.6 | Event controller CRUD | 🔴 | Event handlers missing |
| 5.7 | Events route mounted | 🔴 | `/api/events` unreachable |
| 5.8 | SportBadge uses registry | 🔴 | Hardcoded sports revert |
| 5.9 | EventManager admin page | 🔴 | Admin can't manage events |
| 5.10 | Events + EventDetail pages | 🔴 | Public event pages missing |

---

## 3. 🔧 Resolution & Optimization Playbook

### 3A. Performance Optimization

#### Three.js Bundle (Highest Impact)
| Issue | Solution | Impact |
|-------|----------|:---:|
| Three.js ~180KB in main bundle | ✅ Already code-split as `three-vendor` chunk | -180KB FCP |
| WebGL context on mobile | Lazy-load with `React.lazy()` + `<Suspense>` | Faster mobile load |
| Canvas on low-end devices | Detect WebGL support, show static fallback | Crash prevention |

#### Framer Motion CLS
| Issue | Solution | Impact |
|-------|----------|:---:|
| Animated elements shift layout | Set `layout="position"` or explicit dimensions | CLS < 0.1 |
| Exit animations cause reflow | Use `AnimatePresence` with `mode="wait"` | No CLS during navigation |
| Page transitions on slow devices | ✅ `prefers-reduced-motion` disables animations | Accessibility |

#### API Response Times
| Endpoint | Budget | Optimization |
|----------|:---:|---------|
| `/api/matches` | < 1s | MongoDB compound index on `{sport, status, date}` |
| `/api/events` | < 1s | Index on `{sport, status}`, pagination (✅ done) |
| `/api/leaderboard` | < 1s | Pre-computed aggregation or in-memory cache |
| `/api/departments` | < 500ms | 7 docs — should be instant (cache-able) |

#### Image Optimization Protocol
```bash
# Run image audit
node qa/resolution-playbook.js

# Convert large images to WebP
cwebp -q 80 input.png -o output.webp

# Resize to max 1920px width
convert input.jpg -resize 1920x\> output.jpg

# Compress PNGs
pngquant --quality=65-80 --force input.png
```

### 3B. Traffic Spike Handling (Inter-Branch Finals)

During VNIT IG finals, **500-1000 concurrent users** hit the live scoreboard:

| Layer | Mitigation |
|-------|------------|
| **Socket.io** | ✅ Connection pooling, auto-reconnect, `__SOCKET_CONNECTED` state tracking |
| **MongoDB** | Use connection pool (default 100), add read replicas for leaderboard |
| **Express** | ✅ Rate limiting on auth (20/15min), compression middleware |
| **CDN** | Deploy static assets behind Cloudflare/Vercel Edge |
| **Client** | Debounce API calls, optimistic UI updates, stale-while-revalidate |

### 3C. Security Hardening

| Control | Status | File |
|---------|:---:|------|
| Helmet middleware | ✅ | `server/server.js` |
| Rate limiting | ✅ | `server/server.js` (auth routes) |
| JWT authentication | ✅ | `server/middleware/authMiddleware.js` |
| CORS configuration | ✅ | `server/server.js` |
| Input validation (Mongoose) | ✅ | All models |
| Hidden source maps | ✅ | `client/vite.config.js` |
| Secret admin path | ✅ | `VITE_ADMIN_SECRET_PATH` env var |
| Honeypot routes | ✅ | `/admin/*`, `/wp-admin/*` → AdminBlocker |
| File upload limits | ✅ | `server/middleware/uploadMiddleware.js` (Multer) |

### 3D. Bundle Size Management

**Current budget: < 2MB total JS**

```bash
# Analyze current bundle
node qa/resolution-playbook.js

# Expected chunk breakdown:
# react-core     ~150 KB (React + ReactDOM)
# router         ~30 KB  (React Router)
# animations     ~50 KB  (Framer Motion)
# three-vendor   ~180 KB (Three.js — lazy loaded)
# socket         ~40 KB  (Socket.io client)
# vendor         ~100 KB (Other deps)
# app chunks     ~100 KB (Your code)
```

**Tree-shaking checklist:**
- ✅ No `moment.js` (use `dayjs` if needed)
- ✅ No `lodash` (full import) — use `lodash-es` or native
- ✅ No `jQuery` — React handles DOM
- ✅ `terser` strips `console.log` in production
- ✅ CSS code splitting enabled

---

## 4. 🤖 Automation & CI Pipeline

### GitHub Actions Pipeline (`.github/workflows/ci.yml`)

```
Push/PR to main
       │
       ├─ ① Backend Tests (Jest + in-memory MongoDB)
       │     └─ 30+ match tests, 15+ auth tests
       │
       ├─ ② Frontend Build + Lighthouse CI
       │     ├─ Vite build (0 errors required)
       │     ├─ Lighthouse autorun (4 URLs, 3 runs)
       │     └─ Upload Lighthouse reports artifact
       │
       └─ ③ Error Matrix V2 Quality Gate (76 tests)
              ├─ Start MongoDB 7 + Express server
              ├─ Run qa/error-matrix-tests-v2.js ← HARD GATE
              ├─ Run qa/resolution-playbook.js   ← NEW (advisory)
              ├─ Upload error-matrix-report-v2.json
              ├─ Upload playbook-report.json
              │
              ├─ ④ Docker Build Check
              │     └─ Validate both Dockerfiles build
              │
              └─ ⑤ Sentry Release (main only)
                    ├─ Create release tagged with git SHA
                    └─ Upload hidden source maps
```

### Required GitHub Secrets:
```
SENTRY_AUTH_TOKEN     → Sentry API token (org-level)
SENTRY_ORG            → Your Sentry org slug
SENTRY_PROJECT        → Your Sentry project slug
LHCI_GITHUB_APP_TOKEN → (Optional) Lighthouse CI GitHub App
```

### Deploy gate:
- `quality-gate` → MUST pass (76/76 tests) before Docker build + Sentry release
- `frontend-build` → Lighthouse budgets are warnings (don't block deploy)
- `sentry-release` → Only runs on push to `main` (not PRs)

---

## 5. 📂 QA Files Reference

### Scripts:
| File | Tests | Command |
|------|:---:|---------|
| `qa/error-matrix-tests-v2.js` | 76 | `node qa/error-matrix-tests-v2.js` |
| `qa/error-matrix-tests.js` | 52 | *(Legacy — kept for reference)* |
| `qa/accessibility-audit.js` | WCAG 2.1 AA | `node qa/accessibility-audit.js` |
| `qa/resolution-playbook.js` | Bundle/security/deps | `node qa/resolution-playbook.js [--fix]` |

### Reports (auto-generated):
| File | Generated by |
|------|-------------|
| `qa/error-matrix-report-v2.json` | error-matrix-tests-v2.js |
| `qa/playbook-report.json` | resolution-playbook.js |
| `qa/accessibility-report.json` | accessibility-audit.js |

### Run everything:
```bash
# 1. Start backend
cd server && node server.js &

# 2. Start frontend (for accessibility audit)
cd client && npm run dev &

# 3. Error Matrix V2 (76 tests, needs backend)
node qa/error-matrix-tests-v2.js

# 4. Single category
node qa/error-matrix-tests-v2.js --category=runtime
node qa/error-matrix-tests-v2.js --category=performance
node qa/error-matrix-tests-v2.js --category=structural
node qa/error-matrix-tests-v2.js --category=accessibility
node qa/error-matrix-tests-v2.js --category=events

# 5. Resolution playbook (bundle, deps, security, readiness)
node qa/resolution-playbook.js
node qa/resolution-playbook.js --fix

# 6. Accessibility audit (needs frontend running)
node qa/accessibility-audit.js

# 7. Lighthouse CI
npx lhci autorun

# 8. Backend Jest tests
cd server && npx jest

# 9. E2E tests
npx playwright test
```

---

## 6. 🔍 V2 Changes from V1

| Change | Details |
|--------|---------|
| **+24 new error matrix tests** | 52 → 76 tests |
| **All 13 API mounts tested** | Was only `/api/matches` + `/api/auth` |
| **Events regression category** | 10 tests for sportsRegistry, Event model/controller/routes |
| **Auth security tests** | Bad credentials rejection, unauth protection |
| **Response shape contracts** | Validate JSON structures, paginated responses |
| **Bundle budget test** | Actual dist/ size measured against 2MB cap |
| **Route integrity tests** | App.jsx routes, ErrorBoundary wrapping verified |
| **Navigation tests** | PublicNavbar + AdminLayout include Events links |
| **Theme system test** | All 3 themes (shashwatam, dark, light) verified |
| **Fixed a11y audit routes** | Removed stale `/schedule`, `/highlights`; added `/events` |
| **CI pipeline enhanced** | Resolution playbook now runs in quality-gate; V2 report uploaded |

---

*Generated: VNIT IG शाश्वतम् 2026 | Error Matrix V2 (76 tests) | Full API Surface Coverage*
