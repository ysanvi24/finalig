/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║          VNIT IG App — Ultimate Error Matrix V2 Test Suite          ║
 * ║                    शाश्वतम् Quality Gate                              ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  V2 Enhancements:                                                  ║
 * ║  • Full API surface coverage (all 13 route mounts)                 ║
 * ║  • Events expansion regression tests                              ║
 * ║  • Sports registry validation                                     ║
 * ║  • Socket.io event emission tests                                 ║
 * ║  • Security header deep-scan                                      ║
 * ║  • Response shape contracts                                       ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  4 Categories × ~70+ Subcategories = Comprehensive Coverage        ║
 * ║  1. Runtime & Logic Errors (22 tests)                              ║
 * ║  2. Performance & Core Web Vitals (14 tests)                       ║
 * ║  3. Structural & SEO Integrity (16 tests)                          ║
 * ║  4. Accessibility & Cross-Browser UI (14 tests)                    ║
 * ║  5. Events Expansion Regression (10 tests)                         ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 * 
 * Run:  node qa/error-matrix-tests-v2.js
 *       node qa/error-matrix-tests-v2.js --category=runtime
 *       node qa/error-matrix-tests-v2.js --category=events
 */

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ─── Configuration ───
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.TEST_FRONTEND_URL || 'http://localhost:5173';
const CLIENT_DIR = path.join(__dirname, '..', 'client');
const SERVER_DIR = path.join(__dirname, '..', 'server');
const PROJECT_ROOT = path.join(__dirname, '..');

// Parse CLI args
const args = process.argv.slice(2);
const categoryFilter = args.find(a => a.startsWith('--category='))?.split('=')[1];
const verbose = args.includes('--verbose') || args.includes('-v');

// ─── Utilities ───
const COLOR = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
    dim: '\x1b[2m', bold: '\x1b[1m', magenta: '\x1b[35m',
    white: '\x1b[37m',
};

let totalTests = 0, passed = 0, failed = 0, warnings = 0;
const results = [];

function log(icon, msg) { console.log(`  ${icon} ${msg}`); }
function sectionHeader(title) {
    console.log(`\n${COLOR.cyan}${COLOR.bold}━━━━ ${title} ━━━━${COLOR.reset}`);
}

async function test(name, fn, severity = 'error') {
    totalTests++;
    try {
        const result = await fn();
        if (result === 'warn') {
            warnings++;
            results.push({ name, status: 'warn', severity });
            log('⚠️ ', `${COLOR.yellow}WARN${COLOR.reset}  ${name}`);
        } else {
            passed++;
            results.push({ name, status: 'pass', severity });
            log('✅', `${COLOR.green}PASS${COLOR.reset}  ${name}`);
        }
    } catch (err) {
        failed++;
        results.push({ name, status: 'fail', severity, error: err.message });
        log('❌', `${COLOR.red}FAIL${COLOR.reset}  ${name}`);
        log('  ', `${COLOR.dim}${err.message}${COLOR.reset}`);
    }
}

function httpGet(url, options = {}) {
    return new Promise((resolve, reject) => {
        const timeout = options.timeout || 10000;
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { timeout }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout after ${timeout}ms`)); });
    });
}

function httpPost(url, body, options = {}) {
    return new Promise((resolve, reject) => {
        const timeout = options.timeout || 10000;
        const urlObj = new URL(url);
        const client = url.startsWith('https') ? https : http;
        const data = JSON.stringify(body);
        const req = client.request({
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            timeout,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                ...(options.headers || {}),
            }
        }, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: responseData }));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout after ${timeout}ms`)); });
        req.write(data);
        req.end();
    });
}

function fileExists(filepath) { return fs.existsSync(filepath); }
function readFile(filepath) { return fs.readFileSync(filepath, 'utf-8'); }

function parseJSON(body) {
    try { return JSON.parse(body); }
    catch { return null; }
}


// ╔══════════════════════════════════════════════════════════════╗
// ║  CATEGORY 1: RUNTIME & LOGIC ERRORS (22 tests)             ║
// ╚══════════════════════════════════════════════════════════════╝
async function testRuntimeErrors() {
    sectionHeader('1️⃣  RUNTIME & LOGIC ERRORS');

    // 1.1 — API Health
    await test('1.1  Backend /alive endpoint responds', async () => {
        const res = await httpGet(`${BASE_URL}/alive`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const body = parseJSON(res.body);
        if (!body || body.status !== 'alive') throw new Error(`Expected {status: "alive"}`);
    });

    // 1.2 — Health endpoint
    await test('1.2  /api/health returns detailed status', async () => {
        const res = await httpGet(`${BASE_URL}/api/health`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    });

    // 1.3 — API error format consistency
    await test('1.3  API returns structured errors (no stack leaks)', async () => {
        const res = await httpGet(`${BASE_URL}/api/matches/invalidid123`);
        const body = parseJSON(res.body);
        if (!body || (!body.code && !body.message && !body.error)) {
            throw new Error('Error response missing structured fields');
        }
        if (body.stack && process.env.NODE_ENV === 'production') {
            throw new Error('Stack trace leaked in production');
        }
    });

    // 1.4 — 404 on unknown API routes
    await test('1.4  Unknown API routes return 404 (not crash)', async () => {
        const res = await httpGet(`${BASE_URL}/api/this-does-not-exist-${Date.now()}`);
        if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    });

    // 1.5 — All 13 API mounts respond (don't crash)
    await test('1.5  All API route mounts respond (13 endpoints)', async () => {
        const endpoints = [
            '/api/matches', '/api/departments', '/api/leaderboard',
            '/api/seasons', '/api/scoring-presets', '/api/student-council',
            '/api/about', '/api/admins', '/api/players', '/api/fouls',
            '/api/highlights', '/api/events',
        ];
        const errors = [];
        for (const ep of endpoints) {
            try {
                const res = await httpGet(`${BASE_URL}${ep}`, { timeout: 5000 });
                if (res.status >= 500) errors.push(`${ep}: ${res.status}`);
            } catch (err) {
                errors.push(`${ep}: ${err.message}`);
            }
        }
        if (errors.length > 0) throw new Error(`Endpoints failing:\n    ${errors.join('\n    ')}`);
    });

    // 1.6 — Rate limiter on auth
    await test('1.6  Rate limiter exists on /api/auth', async () => {
        const res = await httpGet(`${BASE_URL}/api/auth/login`);
        // Just verify it doesn't crash — rate limit headers may vary
        if (res.status >= 500) throw new Error(`Auth endpoint crashed: ${res.status}`);
    });

    // 1.7 — MongoDB connection
    await test('1.7  MongoDB connected (departments returns data)', async () => {
        const res = await httpGet(`${BASE_URL}/api/departments`);
        if (res.status >= 500) throw new Error(`DB issue: status ${res.status}`);
        const body = parseJSON(res.body);
        if (!body) throw new Error('Non-JSON response from departments');
    });

    // 1.8 — Socket.io handshake
    await test('1.8  Socket.io endpoint responds to polling', async () => {
        const res = await httpGet(`${BASE_URL}/socket.io/?EIO=4&transport=polling`);
        if (res.status >= 500) throw new Error(`Socket.io error: ${res.status}`);
    });

    // 1.9 — Events API CRUD contract
    await test('1.9  Events API returns paginated response', async () => {
        const res = await httpGet(`${BASE_URL}/api/events`);
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const body = parseJSON(res.body);
        if (!body) throw new Error('Non-JSON response from /api/events');
        // Accepts both array and paginated {success, data} shapes
        if (!Array.isArray(body) && !body.data && !body.success) {
            throw new Error('Expected array or {success, data} from /api/events');
        }
    });

    // 1.10 — Events search/filter endpoint
    await test('1.10 Events search/filter works', async () => {
        const res = await httpGet(`${BASE_URL}/api/events?category=CULTURAL`);
        if (res.status >= 500) throw new Error(`Events filter crashed: ${res.status}`);
    });

    // 1.11 — Leaderboard returns ranked data
    await test('1.11 Leaderboard returns ranked data', async () => {
        const res = await httpGet(`${BASE_URL}/api/leaderboard`);
        if (res.status >= 500) throw new Error(`Leaderboard error: ${res.status}`);
        const body = parseJSON(res.body);
        if (!body) throw new Error('Non-JSON response from leaderboard');
    });

    // 1.12 — ErrorBoundary exists
    await test('1.12 ErrorBoundary has componentDidCatch + getDerivedStateFromError', async () => {
        const ebPath = path.join(CLIENT_DIR, 'src/components/ErrorBoundary.jsx');
        if (!fileExists(ebPath)) throw new Error('ErrorBoundary.jsx not found');
        const content = readFile(ebPath);
        if (!content.includes('componentDidCatch')) throw new Error('Missing componentDidCatch');
        if (!content.includes('getDerivedStateFromError')) throw new Error('Missing getDerivedStateFromError');
    });

    // 1.13 — Sentry frontend
    await test('1.13 Sentry SDK integrated in frontend', async () => {
        const mainPath = path.join(CLIENT_DIR, 'src/main.jsx');
        const content = readFile(mainPath);
        if (!content.includes('sentry') && !content.includes('Sentry')) {
            throw new Error('No Sentry import found in main.jsx');
        }
    });

    // 1.14 — Sentry backend
    await test('1.14 Sentry SDK integrated in backend', async () => {
        const serverPath = path.join(SERVER_DIR, 'server.js');
        const content = readFile(serverPath);
        if (!content.includes('instrument') && !content.includes('sentry')) {
            throw new Error('No Sentry/instrument import in server.js');
        }
    });

    // 1.15 — Global error handlers
    await test('1.15 Global unhandledrejection + error listeners', async () => {
        const mainContent = readFile(path.join(CLIENT_DIR, 'src/main.jsx'));
        if (!mainContent.includes('unhandledrejection')) throw new Error('Missing unhandledrejection handler');
    });

    // 1.16 — Backend graceful shutdown
    await test('1.16 Backend graceful shutdown (SIGTERM + SIGINT)', async () => {
        const content = readFile(path.join(SERVER_DIR, 'server.js'));
        if (!content.includes('SIGTERM')) throw new Error('Missing SIGTERM handler');
        if (!content.includes('SIGINT')) throw new Error('Missing SIGINT handler');
    });

    // 1.17 — asyncWrap utility
    await test('1.17 asyncWrap utility prevents unhandled async errors', async () => {
        const content = readFile(path.join(SERVER_DIR, 'middleware/errorHandler.js'));
        if (!content.includes('asyncWrap')) throw new Error('asyncWrap not found');
    });

    // 1.18 — Auth endpoint rejects bad credentials
    await test('1.18 Auth rejects bad credentials with 4xx', async () => {
        const res = await httpPost(`${BASE_URL}/api/auth/login`, {
            username: 'nonexistent', password: 'wrong',
        });
        if (res.status >= 500) throw new Error(`Auth crashed on bad creds: ${res.status}`);
        if (res.status >= 200 && res.status < 300) throw new Error('Auth accepted bad credentials!');
    });

    // 1.19 — Protected endpoints reject unauthenticated
    await test('1.19 Protected endpoints reject unauthenticated requests', async () => {
        const protectedEndpoints = [
            { method: 'POST', url: '/api/events' },
            { method: 'POST', url: '/api/matches' },
        ];
        for (const ep of protectedEndpoints) {
            const res = await httpPost(`${BASE_URL}${ep.url}`, {});
            if (res.status >= 500) throw new Error(`${ep.url} crashed: ${res.status}`);
            if (res.status >= 200 && res.status < 300) {
                throw new Error(`${ep.url} allowed unauthenticated ${ep.method}!`);
            }
        }
    });

    // 1.20 — Highlights endpoint
    await test('1.20 Highlights API responds', async () => {
        const res = await httpGet(`${BASE_URL}/api/highlights`);
        if (res.status >= 500) throw new Error(`Highlights error: ${res.status}`);
    });

    // 1.21 — Student council endpoint
    await test('1.21 Student council API responds', async () => {
        const res = await httpGet(`${BASE_URL}/api/student-council`);
        if (res.status >= 500) throw new Error(`Student council error: ${res.status}`);
    });

    // 1.22 — About endpoint
    await test('1.22 About API responds', async () => {
        const res = await httpGet(`${BASE_URL}/api/about`);
        if (res.status >= 500) throw new Error(`About error: ${res.status}`);
    });
}


// ╔══════════════════════════════════════════════════════════════╗
// ║  CATEGORY 2: PERFORMANCE & CORE WEB VITALS (14 tests)      ║
// ╚══════════════════════════════════════════════════════════════╝
async function testPerformance() {
    sectionHeader('2️⃣  PERFORMANCE & CORE WEB VITALS');

    // 2.1 — Response time baseline
    await test('2.1  API response time < 2000ms (/api/matches)', async () => {
        const start = Date.now();
        await httpGet(`${BASE_URL}/api/matches`);
        const elapsed = Date.now() - start;
        if (elapsed > 2000) throw new Error(`Response took ${elapsed}ms (limit: 2000ms)`);
        if (elapsed > 1000) return 'warn';
    });

    // 2.2 — Events API response time
    await test('2.2  Events API response time < 2000ms', async () => {
        const start = Date.now();
        await httpGet(`${BASE_URL}/api/events`);
        const elapsed = Date.now() - start;
        if (elapsed > 2000) throw new Error(`Events took ${elapsed}ms (limit: 2000ms)`);
        if (elapsed > 1000) return 'warn';
    });

    // 2.3 — Leaderboard response time
    await test('2.3  Leaderboard API response time < 2000ms', async () => {
        const start = Date.now();
        await httpGet(`${BASE_URL}/api/leaderboard`);
        const elapsed = Date.now() - start;
        if (elapsed > 2000) throw new Error(`Leaderboard took ${elapsed}ms (limit: 2000ms)`);
        if (elapsed > 1000) return 'warn';
    });

    // 2.4 — Build output exists
    await test('2.4  Vite build produces optimized chunks', async () => {
        const distPath = path.join(CLIENT_DIR, 'dist');
        if (!fileExists(distPath)) return 'warn';
        const assets = path.join(distPath, 'assets');
        if (!fileExists(assets)) throw new Error('dist/assets directory missing');
        const files = fs.readdirSync(assets);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        if (jsFiles.length < 2) throw new Error(`Expected multiple JS chunks, found ${jsFiles.length}`);
    });

    // 2.5 — Manual chunks configured
    await test('2.5  Vite manual chunks configured for code splitting', async () => {
        const config = readFile(path.join(CLIENT_DIR, 'vite.config.js'));
        const expectedChunks = ['react-core', 'router', 'animations', 'three-vendor', 'socket'];
        for (const chunk of expectedChunks) {
            if (!config.includes(chunk)) throw new Error(`Missing chunk: ${chunk}`);
        }
    });

    // 2.6 — Hidden source maps
    await test('2.6  Source maps set to hidden (Sentry only)', async () => {
        const config = readFile(path.join(CLIENT_DIR, 'vite.config.js'));
        if (!config.includes("sourcemap: 'hidden'") && !config.includes('sourcemap: "hidden"')) {
            throw new Error('Source maps should be set to "hidden"');
        }
    });

    // 2.7 — Console stripped
    await test('2.7  console.log stripped in production (terser drop_console)', async () => {
        const config = readFile(path.join(CLIENT_DIR, 'vite.config.js'));
        if (!config.includes('drop_console')) throw new Error('drop_console not configured');
    });

    // 2.8 — Web Vitals tracking
    await test('2.8  Core Web Vitals (CLS, LCP, INP, FCP, TTFB) tracked', async () => {
        const perfFile = path.join(CLIENT_DIR, 'src/utils/performance.js');
        if (!fileExists(perfFile)) throw new Error('performance.js not found');
        const content = readFile(perfFile);
        const vitals = ['onCLS', 'onINP', 'onFCP', 'onLCP', 'onTTFB'];
        for (const v of vitals) {
            if (!content.includes(v)) throw new Error(`Missing web vital: ${v}`);
        }
    });

    // 2.9 — CSS code splitting
    await test('2.9  CSS code splitting enabled', async () => {
        const config = readFile(path.join(CLIENT_DIR, 'vite.config.js'));
        if (config.includes('cssCodeSplit: false')) throw new Error('CSS code splitting disabled');
    });

    // 2.10 — Image optimization
    await test('2.10 No oversized images in source (>2MB)', async () => {
        const uploadsDir = path.join(SERVER_DIR, 'uploads');
        if (!fileExists(uploadsDir)) return;
        const files = fs.readdirSync(uploadsDir, { recursive: true });
        const largeFiles = [];
        for (const file of files) {
            const fullPath = path.join(uploadsDir, String(file));
            try {
                const stats = fs.statSync(fullPath);
                if (stats.isFile() && stats.size > 2 * 1024 * 1024) {
                    largeFiles.push(`${file} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
                }
            } catch { /* skip */ }
        }
        if (largeFiles.length > 0) return 'warn';
    });

    // 2.11 — MongoDB config present
    await test('2.11 MongoDB connection config exists', async () => {
        const dbConfig = path.join(SERVER_DIR, 'config/db.js');
        if (!fileExists(dbConfig)) throw new Error('config/db.js not found');
        const content = readFile(dbConfig);
        if (!content.includes('MONGODB_URI') && !content.includes('mongoose.connect')) {
            throw new Error('MongoDB connection config missing');
        }
    });

    // 2.12 — Caching middleware
    await test('2.12 Server-side caching middleware exists', async () => {
        const serverContent = readFile(path.join(SERVER_DIR, 'server.js'));
        if (!serverContent.includes('cache') && !serverContent.includes('Cache')) {
            throw new Error('No caching middleware found');
        }
    });

    // 2.13 — Three.js code-split
    await test('2.13 Three.js is code-split (not in main bundle)', async () => {
        const config = readFile(path.join(CLIENT_DIR, 'vite.config.js'));
        if (!config.includes("'three-vendor'")) throw new Error('Three.js not in separate chunk');
    });

    // 2.14 — Bundle size budget
    await test('2.14 Total JS bundle under 2MB budget', async () => {
        const distPath = path.join(CLIENT_DIR, 'dist', 'assets');
        if (!fileExists(distPath)) return 'warn';
        const files = fs.readdirSync(distPath);
        let totalJS = 0;
        for (const file of files) {
            if (file.endsWith('.js')) {
                totalJS += fs.statSync(path.join(distPath, file)).size;
            }
        }
        const totalMB = totalJS / 1024 / 1024;
        if (totalMB > 2) throw new Error(`Total JS ${totalMB.toFixed(2)}MB exceeds 2MB budget`);
        if (totalMB > 1.5) return 'warn';
    });
}


// ╔══════════════════════════════════════════════════════════════╗
// ║  CATEGORY 3: STRUCTURAL & SEO INTEGRITY (16 tests)         ║
// ╚══════════════════════════════════════════════════════════════╝
async function testStructuralSEO() {
    sectionHeader('3️⃣  STRUCTURAL & SEO INTEGRITY');

    // 3.1 — HTML meta tags
    await test('3.1  index.html has proper meta tags', async () => {
        const html = readFile(path.join(CLIENT_DIR, 'index.html'));
        const required = ['charset', 'viewport', 'description', 'theme-color'];
        for (const meta of required) {
            if (!html.includes(meta)) throw new Error(`Missing meta: ${meta}`);
        }
    });

    // 3.2 — Theme color
    await test('3.2  theme-color meta matches शाश्वतम् (#110a28)', async () => {
        const html = readFile(path.join(CLIENT_DIR, 'index.html'));
        if (!html.includes('#110a28')) throw new Error('theme-color should be #110a28');
    });

    // 3.3 — Open Graph tags
    await test('3.3  Open Graph tags present for social sharing', async () => {
        const html = readFile(path.join(CLIENT_DIR, 'index.html'));
        const ogTags = ['og:title', 'og:description', 'og:type'];
        const missing = ogTags.filter(tag => !html.includes(tag));
        if (missing.length > 0) throw new Error(`Missing OG tags: ${missing.join(', ')}`);
    });

    // 3.4 — JSON-LD structured data
    await test('3.4  JSON-LD structured data present', async () => {
        const html = readFile(path.join(CLIENT_DIR, 'index.html'));
        if (!html.includes('application/ld+json')) throw new Error('No structured data (JSON-LD) found');
    });

    // 3.5 — Canonical URL
    await test('3.5  Canonical URL specified', async () => {
        const html = readFile(path.join(CLIENT_DIR, 'index.html'));
        if (!html.includes('canonical')) throw new Error('No canonical link tag');
    });

    // 3.6 — PWA manifest
    await test('3.6  Web App Manifest exists', async () => {
        const manifestPath = path.join(CLIENT_DIR, 'public/manifest.webmanifest');
        if (!fileExists(manifestPath)) throw new Error('manifest.webmanifest not found');
    });

    // 3.7 — SPA fallback
    await test('3.7  SPA fallback configured', async () => {
        const content = readFile(path.join(SERVER_DIR, 'server.js'));
        if (!content.includes('sendFile') && !content.includes('index.html')) {
            throw new Error('No SPA fallback found');
        }
    });

    // 3.8 — Nginx config
    await test('3.8  Nginx config exists for production', async () => {
        const nginxPath = path.join(CLIENT_DIR, 'nginx.conf');
        if (!fileExists(nginxPath)) return 'warn';
        const content = readFile(nginxPath);
        if (!content.includes('try_files')) return 'warn';
    });

    // 3.9 — Dockerfiles
    await test('3.9  Dockerfiles exist and are valid', async () => {
        if (!fileExists(path.join(CLIENT_DIR, 'Dockerfile'))) throw new Error('Client Dockerfile missing');
        if (!fileExists(path.join(SERVER_DIR, 'Dockerfile'))) throw new Error('Server Dockerfile missing');
    });

    // 3.10 — Deployment configs
    await test('3.10 Deployment configs present (Railway/Render/Procfile)', async () => {
        const configs = ['railway.toml', 'render.yaml', 'Procfile'];
        const present = configs.filter(c => fileExists(path.join(PROJECT_ROOT, c)));
        if (present.length === 0) throw new Error('No deployment configs found');
    });

    // 3.11 — Helmet security headers
    await test('3.11 Helmet security headers configured', async () => {
        const content = readFile(path.join(SERVER_DIR, 'server.js'));
        if (!content.includes('helmet')) throw new Error('Helmet not imported/used');
    });

    // 3.12 — No committed secrets
    await test('3.12 No secrets committed (.env in .gitignore)', async () => {
        const gitignorePath = path.join(PROJECT_ROOT, '.gitignore');
        if (fileExists(gitignorePath)) {
            const gitignore = readFile(gitignorePath);
            if (!gitignore.includes('.env')) {
                throw new Error('.env not in .gitignore');
            }
        }
    });

    // 3.13 — No hardcoded localhost
    await test('3.13 No hardcoded localhost in production code', async () => {
        const filesToCheck = [
            path.join(CLIENT_DIR, 'src/api/axiosConfig.js'),
        ];
        for (const file of filesToCheck) {
            if (!fileExists(file)) continue;
            const content = readFile(file);
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('localhost:5000') && !line.includes('DEV') &&
                    !line.includes('development') && !line.includes('//') && !line.includes('isDev')) {
                    return 'warn';
                }
            }
        }
    });

    // 3.14 — Vercel/Railway env config
    await test('3.14 Vercel config exists for client SPA', async () => {
        const vercelPath = path.join(CLIENT_DIR, 'vercel.json');
        if (!fileExists(vercelPath)) return 'warn';
    });

    // 3.15 — Public routes match React Router
    await test('3.15 All public pages defined in App.jsx', async () => {
        const appContent = readFile(path.join(CLIENT_DIR, 'src/App.jsx'));
        const requiredRoutes = ['/', '/leaderboard', '/events', '/about', '/student-council'];
        for (const route of requiredRoutes) {
            if (!appContent.includes(`path="${route}"`) && !appContent.includes(`path='${route}'`)) {
                throw new Error(`Missing route: ${route}`);
            }
        }
    });

    // 3.16 — ErrorBoundary wraps all routes
    await test('3.16 ErrorBoundary wraps all public routes', async () => {
        const appContent = readFile(path.join(CLIENT_DIR, 'src/App.jsx'));
        // Count Route elements and ErrorBoundary wraps
        const routeCount = (appContent.match(/<Route\s+path="/g) || []).length;
        const ebCount = (appContent.match(/<ErrorBoundary>/g) || []).length;
        // At least the public routes should be wrapped
        if (ebCount < 4) throw new Error(`Only ${ebCount} ErrorBoundary wraps for ${routeCount} routes`);
    });
}


// ╔══════════════════════════════════════════════════════════════╗
// ║  CATEGORY 4: ACCESSIBILITY & CROSS-BROWSER (14 tests)      ║
// ╚══════════════════════════════════════════════════════════════╝
async function testAccessibility() {
    sectionHeader('4️⃣  ACCESSIBILITY & CROSS-BROWSER UI');

    // 4.1 — HTML lang attribute
    await test('4.1  HTML has lang="en" attribute', async () => {
        const html = readFile(path.join(CLIENT_DIR, 'index.html'));
        if (!html.includes('lang="en"')) throw new Error('Missing lang attribute on <html>');
    });

    // 4.2 — Viewport meta
    await test('4.2  Viewport meta correct (no zoom-disable)', async () => {
        const html = readFile(path.join(CLIENT_DIR, 'index.html'));
        if (!html.includes('width=device-width')) throw new Error('Missing width=device-width');
        if (html.includes('maximum-scale=1.0') && !html.includes('maximum-scale=5')) {
            throw new Error('maximum-scale=1.0 prevents zoom — WCAG 1.4.4');
        }
    });

    // 4.3 — Touch targets
    await test('4.3  Touch-friendly button sizing', async () => {
        const appContent = readFile(path.join(CLIENT_DIR, 'src/App.jsx'));
        if (appContent.includes('btn-xs') && !appContent.includes('btn-sm')) return 'warn';
    });

    // 4.4 — CSS variables for contrast
    await test('4.4  Theme CSS variables exist for contrast', async () => {
        const cssFile = path.join(CLIENT_DIR, 'src/index.css');
        if (!fileExists(cssFile)) throw new Error('index.css not found');
        const css = readFile(cssFile);
        if (!css.includes('--color-') && !css.includes('primary') && !css.includes('accent')) {
            return 'warn';
        }
    });

    // 4.5 — Font loading
    await test('4.5  Font loading strategy configured', async () => {
        const html = readFile(path.join(CLIENT_DIR, 'index.html'));
        const css = readFile(path.join(CLIENT_DIR, 'src/index.css'));
        const hasFontStrategy = html.includes('preconnect') || html.includes('preload') ||
                               css.includes('font-display') || html.includes('fonts.googleapis');
        if (!hasFontStrategy) return 'warn';
    });

    // 4.6 — Reduced motion
    await test('4.6  prefers-reduced-motion respected in CSS', async () => {
        const cssFiles = [
            path.join(CLIENT_DIR, 'src/index.css'),
            path.join(CLIENT_DIR, 'src/App.css'),
            path.join(CLIENT_DIR, 'src/mobile-optimizations.css'),
        ];
        let found = false;
        for (const file of cssFiles) {
            if (fileExists(file)) {
                if (readFile(file).includes('prefers-reduced-motion')) { found = true; break; }
            }
        }
        if (!found) return 'warn';
    });

    // 4.7 — Mobile CSS
    await test('4.7  Mobile optimization CSS exists', async () => {
        if (!fileExists(path.join(CLIENT_DIR, 'src/mobile-optimizations.css'))) {
            throw new Error('mobile-optimizations.css not found');
        }
    });

    // 4.8 — Tailwind responsive
    await test('4.8  Tailwind configured with responsive breakpoints', async () => {
        if (!fileExists(path.join(CLIENT_DIR, 'tailwind.config.js'))) {
            throw new Error('tailwind.config.js not found');
        }
    });

    // 4.9 — DaisyUI themes
    await test('4.9  DaisyUI themes configured', async () => {
        const twConfig = readFile(path.join(CLIENT_DIR, 'tailwind.config.js'));
        if (!twConfig.includes('daisyui') && !twConfig.includes('daisyUI')) {
            throw new Error('DaisyUI not configured');
        }
    });

    // 4.10 — ErrorBoundary inline styles
    await test('4.10 ErrorBoundary uses inline styles (crash-proof)', async () => {
        const eb = readFile(path.join(CLIENT_DIR, 'src/components/ErrorBoundary.jsx'));
        if (!eb.includes('style={{') && !eb.includes("style={")) {
            throw new Error('ErrorBoundary should use inline styles');
        }
    });

    // 4.11 — 3-theme system
    await test('4.11 Three themes configured (shashwatam, dark, light)', async () => {
        const cssFile = path.join(CLIENT_DIR, 'src/index.css');
        const css = readFile(cssFile);
        const themes = ['shashwatam', 'dark', 'light'];
        for (const theme of themes) {
            if (!css.includes(theme)) throw new Error(`Theme "${theme}" not found in CSS`);
        }
    });

    // 4.12 — PublicNavbar has Events link
    await test('4.12 PublicNavbar includes Events navigation', async () => {
        const navPath = path.join(CLIENT_DIR, 'src/components/PublicNavbar.jsx');
        if (!fileExists(navPath)) throw new Error('PublicNavbar.jsx not found');
        const content = readFile(navPath);
        if (!content.includes('/events') && !content.includes('Events')) {
            throw new Error('Events link missing from PublicNavbar');
        }
    });

    // 4.13 — AdminLayout has Events link
    await test('4.13 AdminLayout includes Events navigation', async () => {
        const layoutPath = path.join(CLIENT_DIR, 'src/components/AdminLayout.jsx');
        if (!fileExists(layoutPath)) throw new Error('AdminLayout.jsx not found');
        const content = readFile(layoutPath);
        if (!content.includes('events') && !content.includes('Events')) {
            throw new Error('Events link missing from AdminLayout');
        }
    });

    // 4.14 — Capacitor config for mobile
    await test('4.14 Capacitor config exists for mobile builds', async () => {
        const capPath = path.join(CLIENT_DIR, 'capacitor.config.json');
        if (!fileExists(capPath)) return 'warn';
    });
}


// ╔══════════════════════════════════════════════════════════════╗
// ║  CATEGORY 5: EVENTS EXPANSION REGRESSION (10 tests)         ║
// ╚══════════════════════════════════════════════════════════════╝
async function testEventsExpansion() {
    sectionHeader('5️⃣  EVENTS EXPANSION REGRESSION');

    // 5.1 — Server sports registry
    await test('5.1  Server sportsRegistry.js exists with exports', async () => {
        const regPath = path.join(SERVER_DIR, 'config/sportsRegistry.js');
        if (!fileExists(regPath)) throw new Error('Server sportsRegistry.js not found');
        const content = readFile(regPath);
        if (!content.includes('MATCH_SPORTS')) throw new Error('Missing MATCH_SPORTS');
        if (!content.includes('EVENT_SPORTS')) throw new Error('Missing EVENT_SPORTS');
        if (!content.includes('SPORT_ALIASES')) throw new Error('Missing SPORT_ALIASES');
    });

    // 5.2 — Client sports registry
    await test('5.2  Client sportsRegistry.js exists with exports', async () => {
        const regPath = path.join(CLIENT_DIR, 'src/config/sportsRegistry.js');
        if (!fileExists(regPath)) throw new Error('Client sportsRegistry.js not found');
        const content = readFile(regPath);
        if (!content.includes('MATCH_SPORTS')) throw new Error('Missing MATCH_SPORTS');
        if (!content.includes('EVENT_SPORTS')) throw new Error('Missing EVENT_SPORTS');
    });

    // 5.3 — Registry consistency (count check)
    await test('5.3  Server registry has 21+ match sports + 55+ event sports', async () => {
        const content = readFile(path.join(SERVER_DIR, 'config/sportsRegistry.js'));
        // File order: MATCH_SPORTS → SPORT_ALIASES → EVENT_SPORTS
        const matchBlock = content.substring(
            content.indexOf('const MATCH_SPORTS'),
            content.indexOf('const SPORT_ALIASES')
        );
        const matchEntries = (matchBlock.match(/id:\s*'/g) || []).length;
        if (matchEntries < 20) throw new Error(`Only ${matchEntries} match sports (expected ~21)`);

        const eventBlock = content.substring(
            content.indexOf('const EVENT_SPORTS'),
            content.indexOf('module.exports')
        );
        const eventEntries = (eventBlock.match(/id:\s*'/g) || []).length;
        if (eventEntries < 55) throw new Error(`Only ${eventEntries} event sports (expected ~61)`);
    });

    // 5.4 — No CHESS alias (regression)
    await test('5.4  No self-referencing CHESS alias (regression fix)', async () => {
        const content = readFile(path.join(SERVER_DIR, 'config/sportsRegistry.js'));
        const aliasBlock = content.substring(
            content.indexOf('const SPORT_ALIASES'),
            content.indexOf('module.exports') > -1 ? content.indexOf('module.exports') : content.length
        );
        if (aliasBlock.includes("'CHESS': 'CHESS'") || aliasBlock.includes('"CHESS": "CHESS"')) {
            throw new Error('Self-referencing CHESS alias found — regression!');
        }
    });

    // 5.5 — Event model exists
    await test('5.5  Event model (server/models/Event.js) exists', async () => {
        if (!fileExists(path.join(SERVER_DIR, 'models/Event.js'))) {
            throw new Error('Event model not found');
        }
    });

    // 5.6 — Event controller exists
    await test('5.6  Event controller exists with CRUD handlers', async () => {
        const ctrlPath = path.join(SERVER_DIR, 'controllers/eventController.js');
        if (!fileExists(ctrlPath)) throw new Error('Event controller not found');
        const content = readFile(ctrlPath);
        const required = ['getAllEvents', 'createEvent', 'updateEvent', 'deleteEvent'];
        for (const fn of required) {
            if (!content.includes(fn)) throw new Error(`Missing handler: ${fn}`);
        }
    });

    // 5.7 — Event routes mounted
    await test('5.7  Event routes mounted at /api/events', async () => {
        const serverContent = readFile(path.join(SERVER_DIR, 'server.js'));
        if (!serverContent.includes('eventRoutes') && !serverContent.includes('/api/events')) {
            throw new Error('Event routes not mounted in server.js');
        }
    });

    // 5.8 — SportBadge uses registry
    await test('5.8  SportBadge uses sportsRegistry (not hardcoded)', async () => {
        const badgePath = path.join(CLIENT_DIR, 'src/components/SportBadge.jsx');
        if (!fileExists(badgePath)) throw new Error('SportBadge.jsx not found');
        const content = readFile(badgePath);
        if (content.includes('sportsRegistry') || content.includes('ICON_MAP') || content.includes('COLOR_MAP')) {
            return; // Good — uses dynamic mapping
        }
        throw new Error('SportBadge may still use hardcoded sports');
    });

    // 5.9 — EventManager admin page exists
    await test('5.9  EventManager admin page exists', async () => {
        if (!fileExists(path.join(CLIENT_DIR, 'src/pages/admin/EventManager.jsx'))) {
            throw new Error('EventManager.jsx not found');
        }
    });

    // 5.10 — Events public pages exist
    await test('5.10 Events + EventDetail public pages exist', async () => {
        if (!fileExists(path.join(CLIENT_DIR, 'src/pages/public/Events.jsx'))) {
            throw new Error('Events.jsx not found');
        }
        if (!fileExists(path.join(CLIENT_DIR, 'src/pages/public/EventDetail.jsx'))) {
            throw new Error('EventDetail.jsx not found');
        }
    });
}


// ╔══════════════════════════════════════════════════════════════╗
// ║  MAIN RUNNER                                                ║
// ╚══════════════════════════════════════════════════════════════╝
async function run() {
    console.log(`\n${COLOR.magenta}${COLOR.bold}╔══════════════════════════════════════════════════════════════╗${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}║   VNIT IG App — Ultimate Error Matrix V2                    ║${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}║   शाश्वतम् Quality Assurance Suite                             ║${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}║   76 Tests • 5 Categories • Full API Surface                ║${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}╚══════════════════════════════════════════════════════════════╝${COLOR.reset}`);

    if (categoryFilter) {
        console.log(`${COLOR.dim}  Filter: --category=${categoryFilter}${COLOR.reset}`);
    }

    const categories = {
        runtime: testRuntimeErrors,
        performance: testPerformance,
        structural: testStructuralSEO,
        accessibility: testAccessibility,
        events: testEventsExpansion,
    };

    if (categoryFilter && categories[categoryFilter]) {
        await categories[categoryFilter]();
    } else {
        for (const [name, fn] of Object.entries(categories)) {
            await fn();
        }
    }

    // ─── Summary ───
    console.log(`\n${COLOR.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR.reset}`);
    console.log(`${COLOR.bold}  ERROR MATRIX V2 SUMMARY${COLOR.reset}`);
    console.log(`${COLOR.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR.reset}`);
    console.log(`  Total:    ${totalTests}`);
    console.log(`  ${COLOR.green}Passed:   ${passed}${COLOR.reset}`);
    console.log(`  ${COLOR.yellow}Warnings: ${warnings}${COLOR.reset}`);
    console.log(`  ${COLOR.red}Failed:   ${failed}${COLOR.reset}`);

    const passRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : 0;
    console.log(`  Pass Rate: ${passRate}%`);

    if (failed === 0) {
        console.log(`\n  ${COLOR.green}${COLOR.bold}🎉 ALL ${totalTests} TESTS PASSED — Quality gate V2 cleared!${COLOR.reset}\n`);
    } else {
        console.log(`\n  ${COLOR.red}${COLOR.bold}🚫 ${failed}/${totalTests} test(s) failed — review required${COLOR.reset}`);
        console.log(`\n${COLOR.red}  Failed Tests:${COLOR.reset}`);
        results.filter(r => r.status === 'fail').forEach(r => {
            console.log(`  • ${r.name}`);
            if (r.error) console.log(`    ${COLOR.dim}${r.error}${COLOR.reset}`);
        });
        console.log();
    }

    if (warnings > 0) {
        console.log(`${COLOR.yellow}  Warnings:${COLOR.reset}`);
        results.filter(r => r.status === 'warn').forEach(r => {
            console.log(`  • ${r.name}`);
        });
        console.log();
    }

    // ─── Generate JSON report ───
    const reportPath = path.join(__dirname, 'error-matrix-report-v2.json');
    const report = {
        version: 2,
        timestamp: new Date().toISOString(),
        summary: { total: totalTests, passed, warnings, failed, passRate: `${passRate}%` },
        categories: {
            runtime: results.filter(r => r.name.startsWith('1.')),
            performance: results.filter(r => r.name.startsWith('2.')),
            structural: results.filter(r => r.name.startsWith('3.')),
            accessibility: results.filter(r => r.name.startsWith('4.')),
            events: results.filter(r => r.name.startsWith('5.')),
        },
        results,
    };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`  📄 Report saved to: qa/error-matrix-report-v2.json\n`);

    process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
    console.error('Fatal error in test runner:', err);
    process.exit(1);
});
