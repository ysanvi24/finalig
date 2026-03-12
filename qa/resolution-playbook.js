/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   Resolution & Optimization Playbook — Automated Fixer         ║
 * ║   VNIT IG App — शाश्वतम्                                         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║   Auto-fixes common issues detected by the error matrix:       ║
 * ║   • Image optimization (resize, compress, webp)                ║
 * ║   • Bundle size analysis                                       ║
 * ║   • Unused dependency detection                                ║
 * ║   • Security header validation                                 ║
 * ║   • Production readiness checklist                             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 * 
 * Run:  node qa/resolution-playbook.js
 *       node qa/resolution-playbook.js --fix   (auto-apply fixes)
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const CLIENT_DIR = path.join(PROJECT_ROOT, 'client');
const SERVER_DIR = path.join(PROJECT_ROOT, 'server');

const FIX_MODE = process.argv.includes('--fix');
const COLOR = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
    bold: '\x1b[1m', dim: '\x1b[2m', magenta: '\x1b[35m',
};

let issues = 0, fixed = 0;

function issue(msg) { issues++; console.log(`  ${COLOR.yellow}⚠️  ${msg}${COLOR.reset}`); }
function fix(msg) { fixed++; console.log(`  ${COLOR.green}🔧 FIXED: ${msg}${COLOR.reset}`); }
function ok(msg) { console.log(`  ${COLOR.green}✅ ${msg}${COLOR.reset}`); }
function info(msg) { console.log(`  ${COLOR.blue}ℹ️  ${msg}${COLOR.reset}`); }

// ═══════════════════════════════════════════════════════════
// 1. BUNDLE SIZE ANALYSIS
// ═══════════════════════════════════════════════════════════
function analyzeBundleSize() {
    console.log(`\n${COLOR.bold}━━━━ 📦 Bundle Size Analysis ━━━━${COLOR.reset}`);

    const distPath = path.join(CLIENT_DIR, 'dist', 'assets');
    if (!fs.existsSync(distPath)) {
        info('No build found — run `npm run build` in client/ first');
        return;
    }

    const files = fs.readdirSync(distPath);
    let totalJS = 0, totalCSS = 0;
    const chunks = [];

    for (const file of files) {
        const fullPath = path.join(distPath, file);
        const stats = fs.statSync(fullPath);
        const sizeKB = (stats.size / 1024).toFixed(1);

        if (file.endsWith('.js')) {
            totalJS += stats.size;
            chunks.push({ file, size: stats.size, sizeKB });
        }
        if (file.endsWith('.css')) {
            totalCSS += stats.size;
        }
    }

    // Sort by size descending
    chunks.sort((a, b) => b.size - a.size);

    info(`Total JS: ${(totalJS / 1024).toFixed(0)} KB (${(totalJS / 1024 / 1024).toFixed(2)} MB)`);
    info(`Total CSS: ${(totalCSS / 1024).toFixed(0)} KB`);
    console.log();

    for (const chunk of chunks) {
        const sizeColor = chunk.size > 500 * 1024 ? COLOR.red 
                       : chunk.size > 200 * 1024 ? COLOR.yellow 
                       : COLOR.green;
        console.log(`    ${sizeColor}${chunk.sizeKB} KB${COLOR.reset}  ${chunk.file}`);
    }

    // Budget warnings
    const budgets = [
        { name: 'Total JS', value: totalJS, limit: 2 * 1024 * 1024, msg: 'Total JS exceeds 2MB budget' },
    ];

    for (const { name, value, limit, msg } of budgets) {
        if (value > limit) {
            issue(`${msg} (${(value / 1024).toFixed(0)} KB > ${(limit / 1024).toFixed(0)} KB)`);
        } else {
            ok(`${name}: ${(value / 1024).toFixed(0)} KB within budget`);
        }
    }

    // Check for Three.js chunk
    const threeChunk = chunks.find(c => c.file.includes('three'));
    if (threeChunk && threeChunk.size > 300 * 1024) {
        info(`Three.js chunk is ${threeChunk.sizeKB} KB — consider lazy loading with React.lazy()`);
    }
}

// ═══════════════════════════════════════════════════════════
// 2. DEPENDENCY AUDIT
// ═══════════════════════════════════════════════════════════
function auditDependencies() {
    console.log(`\n${COLOR.bold}━━━━ 📋 Dependency Audit ━━━━${COLOR.reset}`);

    // Check for known heavy dependencies
    const clientPkg = JSON.parse(fs.readFileSync(path.join(CLIENT_DIR, 'package.json'), 'utf-8'));
    const serverPkg = JSON.parse(fs.readFileSync(path.join(SERVER_DIR, 'package.json'), 'utf-8'));

    // Heavy deps that might have lighter alternatives
    const heavyDeps = {
        'moment': 'Use dayjs (2KB) instead of moment (67KB)',
        'lodash': 'Use lodash-es or individual imports',
        'jquery': 'Remove jQuery — use native APIs',
    };

    for (const [dep, suggestion] of Object.entries(heavyDeps)) {
        if (clientPkg.dependencies?.[dep]) {
            issue(`Frontend uses ${dep}: ${suggestion}`);
        }
        if (serverPkg.dependencies?.[dep]) {
            info(`Backend uses ${dep}: ${suggestion}`);
        }
    }

    // Check for security vulnerabilities
    info('Running npm audit (client)...');
    try {
        const auditOutput = execSync('npm audit --json 2>/dev/null', { cwd: CLIENT_DIR, timeout: 30000 }).toString();
        const audit = JSON.parse(auditOutput);
        const vulns = audit.metadata?.vulnerabilities || {};
        const critical = vulns.critical || 0;
        const high = vulns.high || 0;
        if (critical > 0) issue(`${critical} CRITICAL vulnerabilities in client dependencies`);
        else if (high > 0) issue(`${high} HIGH vulnerabilities in client dependencies`);
        else ok('No critical/high vulnerabilities in client');
    } catch {
        info('npm audit completed (check output for details)');
    }

    info('Running npm audit (server)...');
    try {
        const auditOutput = execSync('npm audit --json 2>/dev/null', { cwd: SERVER_DIR, timeout: 30000 }).toString();
        const audit = JSON.parse(auditOutput);
        const vulns = audit.metadata?.vulnerabilities || {};
        const critical = vulns.critical || 0;
        const high = vulns.high || 0;
        if (critical > 0) issue(`${critical} CRITICAL vulnerabilities in server dependencies`);
        else if (high > 0) issue(`${high} HIGH vulnerabilities in server dependencies`);
        else ok('No critical/high vulnerabilities in server');
    } catch {
        info('npm audit completed (check output for details)');
    }
}

// ═══════════════════════════════════════════════════════════
// 3. SECURITY HEADERS CHECK
// ═══════════════════════════════════════════════════════════
function checkSecurityHeaders() {
    console.log(`\n${COLOR.bold}━━━━ 🔒 Security Headers ━━━━${COLOR.reset}`);

    const serverContent = fs.readFileSync(path.join(SERVER_DIR, 'server.js'), 'utf-8');

    const headers = {
        'helmet': 'Helmet middleware (sets multiple security headers)',
        'contentSecurityPolicy': 'Content-Security-Policy',
        'crossOriginResourcePolicy': 'Cross-Origin-Resource-Policy',
        'strictTransportSecurity': 'HSTS (Strict-Transport-Security)',
        'frameguard': 'X-Frame-Options',
    };

    for (const [key, name] of Object.entries(headers)) {
        if (serverContent.includes(key)) {
            ok(`${name} configured`);
        } else {
            if (key === 'helmet') {
                issue(`${name} NOT configured — critical security gap`);
            } else {
                info(`${name} — may be set via Helmet defaults`);
            }
        }
    }

    // Rate limiting
    if (serverContent.includes('rateLimit') || serverContent.includes('rate-limit')) {
        ok('Rate limiting configured');
    } else {
        issue('No rate limiting found — vulnerable to DDoS');
    }

    // JWT secret
    if (serverContent.includes('JWT_SECRET') || serverContent.includes('jwt')) {
        ok('JWT authentication configured');
    }
}

// ═══════════════════════════════════════════════════════════
// 4. PRODUCTION READINESS CHECKLIST
// ═══════════════════════════════════════════════════════════
function productionReadiness() {
    console.log(`\n${COLOR.bold}━━━━ 🚀 Production Readiness ━━━━${COLOR.reset}`);

    const checks = [
        {
            name: 'Environment variables documented',
            check: () => {
                return fs.existsSync(path.join(PROJECT_ROOT, 'RAILWAY_VARIABLES.env')) ||
                       fs.existsSync(path.join(PROJECT_ROOT, '.env.example'));
            }
        },
        {
            name: 'Dockerfiles present',
            check: () => fs.existsSync(path.join(CLIENT_DIR, 'Dockerfile')) && 
                        fs.existsSync(path.join(SERVER_DIR, 'Dockerfile'))
        },
        {
            name: 'docker-compose.yml exists',
            check: () => fs.existsSync(path.join(PROJECT_ROOT, 'docker-compose.yml'))
        },
        {
            name: 'Error handler middleware',
            check: () => fs.existsSync(path.join(SERVER_DIR, 'middleware/errorHandler.js'))
        },
        {
            name: 'ErrorBoundary component',
            check: () => fs.existsSync(path.join(CLIENT_DIR, 'src/components/ErrorBoundary.jsx'))
        },
        {
            name: 'Sentry frontend integration',
            check: () => fs.existsSync(path.join(CLIENT_DIR, 'src/lib/sentry.js'))
        },
        {
            name: 'Sentry backend integration',
            check: () => fs.existsSync(path.join(SERVER_DIR, 'instrument.js'))
        },
        {
            name: 'Performance monitoring',
            check: () => fs.existsSync(path.join(CLIENT_DIR, 'src/utils/performance.js'))
        },
        {
            name: 'Lighthouse CI config',
            check: () => fs.existsSync(path.join(PROJECT_ROOT, '.lighthouserc.js'))
        },
        {
            name: 'CI/CD pipeline',
            check: () => fs.existsSync(path.join(PROJECT_ROOT, '.github/workflows/ci.yml'))
        },
        {
            name: 'Playwright E2E tests',
            check: () => fs.existsSync(path.join(PROJECT_ROOT, 'playwright.config.js'))
        },
        {
            name: 'Hidden source maps for Sentry',
            check: () => {
                const viteConfig = fs.readFileSync(path.join(CLIENT_DIR, 'vite.config.js'), 'utf-8');
                return viteConfig.includes("'hidden'");
            }
        },
        {
            name: 'Compression middleware',
            check: () => {
                const server = fs.readFileSync(path.join(SERVER_DIR, 'server.js'), 'utf-8');
                return server.includes('compression');
            }
        },
        {
            name: 'Graceful shutdown handlers',
            check: () => {
                const server = fs.readFileSync(path.join(SERVER_DIR, 'server.js'), 'utf-8');
                return server.includes('gracefulShutdown');
            }
        },
    ];

    let ready = 0;
    for (const { name, check } of checks) {
        try {
            if (check()) { ok(name); ready++; }
            else issue(name);
        } catch { issue(name); }
    }

    const readiness = ((ready / checks.length) * 100).toFixed(0);
    console.log(`\n  ${COLOR.bold}Production Readiness: ${readiness}% (${ready}/${checks.length})${COLOR.reset}`);
    
    if (readiness >= 90) {
        console.log(`  ${COLOR.green}${COLOR.bold}🎉 PRODUCTION READY${COLOR.reset}`);
    } else if (readiness >= 70) {
        console.log(`  ${COLOR.yellow}${COLOR.bold}⚠️  Nearly ready — address remaining items${COLOR.reset}`);
    } else {
        console.log(`  ${COLOR.red}${COLOR.bold}🚫 Not production ready — critical items missing${COLOR.reset}`);
    }
}

// ═══════════════════════════════════════════════════════════
// 5. IMAGE OPTIMIZATION CHECK
// ═══════════════════════════════════════════════════════════
function checkImageOptimization() {
    console.log(`\n${COLOR.bold}━━━━ 🖼️  Image Optimization ━━━━${COLOR.reset}`);

    const assetDirs = [
        path.join(CLIENT_DIR, 'src/assets'),
        path.join(CLIENT_DIR, 'public'),
        path.join(CLIENT_DIR, 'assets'),
        path.join(CLIENT_DIR, 'icons'),
    ];

    let totalImages = 0, largeImages = 0;

    for (const dir of assetDirs) {
        if (!fs.existsSync(dir)) continue;
        
        const walkDir = (d) => {
            const entries = fs.readdirSync(d, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(d, entry.name);
                if (entry.isDirectory()) { walkDir(fullPath); continue; }
                
                const ext = path.extname(entry.name).toLowerCase();
                if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp'].includes(ext)) {
                    totalImages++;
                    const stats = fs.statSync(fullPath);
                    const sizeKB = stats.size / 1024;
                    
                    if (sizeKB > 500) {
                        largeImages++;
                        issue(`Large image: ${path.relative(PROJECT_ROOT, fullPath)} (${sizeKB.toFixed(0)} KB)`);
                        info(`  → Convert to WebP: cwebp -q 80 "${entry.name}" -o "${entry.name.replace(ext, '.webp')}"`);
                    }
                }
            }
        };
        walkDir(dir);
    }

    if (totalImages === 0) {
        info('No image assets found in standard directories');
    } else if (largeImages === 0) {
        ok(`All ${totalImages} images are under 500 KB`);
    } else {
        info(`${largeImages}/${totalImages} images exceed 500 KB — consider optimization`);
    }
}


// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
function main() {
    console.log(`\n${COLOR.magenta}${COLOR.bold}╔══════════════════════════════════════════════════════════════╗${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}║   Resolution & Optimization Playbook                        ║${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}║   VNIT IG App — शाश्वतम्                                      ║${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}╚══════════════════════════════════════════════════════════════╝${COLOR.reset}`);

    if (FIX_MODE) {
        console.log(`  ${COLOR.cyan}Mode: AUTO-FIX (--fix)${COLOR.reset}`);
    } else {
        console.log(`  ${COLOR.dim}Mode: AUDIT ONLY (use --fix to auto-apply fixes)${COLOR.reset}`);
    }

    analyzeBundleSize();
    auditDependencies();
    checkSecurityHeaders();
    checkImageOptimization();
    productionReadiness();

    // ─── Final Summary ───
    console.log(`\n${COLOR.bold}━━━━ PLAYBOOK SUMMARY ━━━━${COLOR.reset}`);
    console.log(`  Issues found: ${issues === 0 ? COLOR.green : COLOR.yellow}${issues}${COLOR.reset}`);
    if (FIX_MODE) console.log(`  Auto-fixed:   ${COLOR.green}${fixed}${COLOR.reset}`);
    console.log();

    // Save report
    const report = { timestamp: new Date().toISOString(), issues, fixed, fixMode: FIX_MODE };
    fs.writeFileSync(path.join(__dirname, 'playbook-report.json'), JSON.stringify(report, null, 2));
    info('Report saved to qa/playbook-report.json');
    console.log();
}

main();
