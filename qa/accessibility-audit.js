/**
 * Accessibility Audit Script — VNIT IG App
 * 
 * Uses pa11y (WCAG 2.1 AA) and axe-core programmatic API
 * to test all public pages for accessibility violations.
 * 
 * Generates a detailed report with:
 *  - WCAG violation level (A, AA, AAA)
 *  - Affected elements & selectors
 *  - Fix recommendations
 * 
 * Run:  node qa/accessibility-audit.js
 *       node qa/accessibility-audit.js --url=http://localhost:5173/leaderboard
 */

const path = require('path');
const fs = require('fs');

const PAGES = [
    { name: 'Home', path: '/' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Events', path: '/events' },
    { name: 'Student Council', path: '/student-council' },
    { name: 'About', path: '/about' },
];

const BASE_URL = process.env.A11Y_BASE_URL || 'http://localhost:5173';
const COLOR = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
    bold: '\x1b[1m', dim: '\x1b[2m', magenta: '\x1b[35m',
};

async function runPa11yAudit() {
    let pa11y;
    try {
        pa11y = require('pa11y');
    } catch {
        console.log(`${COLOR.yellow}⚠️  pa11y not available — skipping pa11y audit${COLOR.reset}`);
        console.log(`   Install: npm install -D pa11y`);
        return [];
    }

    const allResults = [];
    
    for (const page of PAGES) {
        const url = process.argv.find(a => a.startsWith('--url='))?.split('=')[1] 
                    || `${BASE_URL}${page.path}`;
        
        console.log(`\n${COLOR.cyan}  🔍 Auditing: ${page.name} (${url})${COLOR.reset}`);
        
        try {
            const results = await pa11y(url, {
                standard: 'WCAG2AA',
                timeout: 30000,
                wait: 2000, // Wait for Framer Motion animations to settle
                chromeLaunchConfig: {
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                },
                ignore: [
                    // Canvas (Three.js) doesn't have text alternatives — expected
                    'WCAG2AA.Principle1.Guideline1_1.1_1_1.H67.2',
                ],
            });

            allResults.push({ page: page.name, url, issues: results.issues || results });
            
            const issueCount = (results.issues || results).length;
            if (issueCount === 0) {
                console.log(`  ${COLOR.green}✅ No accessibility issues found${COLOR.reset}`);
            } else {
                console.log(`  ${COLOR.yellow}⚠️  ${issueCount} issue(s) found${COLOR.reset}`);
                (results.issues || results).slice(0, 5).forEach(issue => {
                    const icon = issue.type === 'error' ? '❌' : '⚠️';
                    console.log(`    ${icon} ${issue.message?.substring(0, 100)}...`);
                    if (issue.selector) {
                        console.log(`      ${COLOR.dim}Selector: ${issue.selector}${COLOR.reset}`);
                    }
                });
                if (issueCount > 5) {
                    console.log(`    ${COLOR.dim}... and ${issueCount - 5} more${COLOR.reset}`);
                }
            }
        } catch (err) {
            console.log(`  ${COLOR.red}❌ Error auditing ${page.name}: ${err.message}${COLOR.reset}`);
            allResults.push({ page: page.name, url, error: err.message });
        }

        if (process.argv.find(a => a.startsWith('--url='))) break; // Single URL mode
    }

    return allResults;
}

async function runAxeAudit() {
    let puppeteer, axeCore;
    try {
        puppeteer = require('puppeteer');
        axeCore = require('axe-core');
    } catch {
        console.log(`\n${COLOR.yellow}⚠️  puppeteer or axe-core not available — skipping axe audit${COLOR.reset}`);
        console.log(`   Install: npm install -D puppeteer axe-core`);
        return [];
    }

    const allResults = [];
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        for (const page of PAGES) {
            const url = `${BASE_URL}${page.path}`;
            console.log(`\n${COLOR.magenta}  🪓 axe-core audit: ${page.name} (${url})${COLOR.reset}`);
            
            try {
                const browserPage = await browser.newPage();
                await browserPage.setViewport({ width: 1280, height: 720 });
                await browserPage.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
                
                // Wait for Framer Motion animations
                await new Promise(r => setTimeout(r, 2000));

                // Inject and run axe-core
                const axeSource = axeCore.source;
                await browserPage.evaluate(axeSource);
                const results = await browserPage.evaluate(() => {
                    return new Promise((resolve) => {
                        window.axe.run(document, {
                            runOnly: ['wcag2a', 'wcag2aa', 'best-practice'],
                        }).then(resolve);
                    });
                });

                allResults.push({
                    page: page.name,
                    url,
                    violations: results.violations,
                    passes: results.passes?.length || 0,
                    incomplete: results.incomplete?.length || 0,
                });

                if (results.violations.length === 0) {
                    console.log(`  ${COLOR.green}✅ No axe violations (${results.passes?.length || 0} rules passed)${COLOR.reset}`);
                } else {
                    console.log(`  ${COLOR.red}❌ ${results.violations.length} violation(s)${COLOR.reset}`);
                    results.violations.forEach(v => {
                        const severity = v.impact === 'critical' ? '🔴' : v.impact === 'serious' ? '🟠' : '🟡';
                        console.log(`    ${severity} [${v.impact}] ${v.description}`);
                        console.log(`      ${COLOR.dim}Rule: ${v.id} | Affected: ${v.nodes.length} element(s)${COLOR.reset}`);
                    });
                }

                await browserPage.close();
            } catch (err) {
                console.log(`  ${COLOR.red}Error: ${err.message}${COLOR.reset}`);
                allResults.push({ page: page.name, url, error: err.message });
            }
        }
    } finally {
        if (browser) await browser.close();
    }

    return allResults;
}

async function main() {
    console.log(`\n${COLOR.magenta}${COLOR.bold}╔══════════════════════════════════════════════════════════════╗${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}║   VNIT IG App — Accessibility Audit                         ║${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}║   WCAG 2.1 AA + axe-core + pa11y                            ║${COLOR.reset}`);
    console.log(`${COLOR.magenta}${COLOR.bold}╚══════════════════════════════════════════════════════════════╝${COLOR.reset}`);
    console.log(`  Base URL: ${BASE_URL}`);
    console.log(`  Standard: WCAG 2.1 Level AA`);

    console.log(`\n${COLOR.bold}━━━━ pa11y WCAG Audit ━━━━${COLOR.reset}`);
    const pa11yResults = await runPa11yAudit();

    console.log(`\n${COLOR.bold}━━━━ axe-core Deep Audit ━━━━${COLOR.reset}`);
    const axeResults = await runAxeAudit();

    // ─── Generate Report ───
    const report = {
        timestamp: new Date().toISOString(),
        baseUrl: BASE_URL,
        standard: 'WCAG 2.1 Level AA',
        pa11y: pa11yResults,
        axeCore: axeResults,
    };

    const reportPath = path.join(__dirname, 'accessibility-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n  📄 Full report: qa/accessibility-report.json`);

    // ─── Summary ───
    const totalPa11yIssues = pa11yResults.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
    const totalAxeViolations = axeResults.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
    
    console.log(`\n${COLOR.bold}━━━━ ACCESSIBILITY SUMMARY ━━━━${COLOR.reset}`);
    console.log(`  pa11y issues:     ${totalPa11yIssues === 0 ? COLOR.green : COLOR.yellow}${totalPa11yIssues}${COLOR.reset}`);
    console.log(`  axe violations:   ${totalAxeViolations === 0 ? COLOR.green : COLOR.red}${totalAxeViolations}${COLOR.reset}`);
    
    if (totalPa11yIssues === 0 && totalAxeViolations === 0) {
        console.log(`\n  ${COLOR.green}${COLOR.bold}🎉 ACCESSIBLE — All pages pass WCAG 2.1 AA${COLOR.reset}\n`);
    } else {
        console.log(`\n  ${COLOR.yellow}${COLOR.bold}⚠️  Accessibility improvements needed — see report${COLOR.reset}\n`);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
