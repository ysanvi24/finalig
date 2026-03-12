/**
 * Lighthouse CI Configuration — VNIT IG App
 * 
 * Runs Lighthouse audits against the production build
 * and enforces performance/accessibility/SEO budgets.
 * 
 * Usage (local):
 *   npx lhci autorun
 * 
 * Usage (CI):
 *   See .github/workflows/lighthouse-ci.yml
 */
module.exports = {
    ci: {
        collect: {
            // URLs to audit (in production build mode)
            url: [
                'http://localhost:5000/',           // Home / Landing
                'http://localhost:5000/schedule',    // Match schedule
                'http://localhost:5000/leaderboard', // Leaderboard
                'http://localhost:5000/highlights',  // Highlights
            ],
            numberOfRuns: 3, // Run 3 times, report median
            settings: {
                // Simulate a mid-tier phone on 4G (Indian college campus network)
                preset: 'desktop', // Change to 'perf' for mobile throttling
                throttling: {
                    rttMs: 150,                // 150ms RTT (campus WiFi)
                    throughputKbps: 1638.4,    // 1.6 Mbps (shared WiFi)
                    cpuSlowdownMultiplier: 2,  // Mid-tier Android phone
                },
                // Skip specific audits that don't apply to SPAs
                skipAudits: [
                    'redirects',        // SPA doesn't do server redirects
                    'uses-http2',       // Depends on hosting provider
                ],
            },
        },
        assert: {
            // ─── Performance Budgets ───
            // Based on VNIT campus network characteristics:
            // - Students on mid-tier Android phones
            // - Shared campus WiFi (1-5 Mbps)
            // - Important: Three.js 3D content inflates FCP/LCP
            assertions: {
                // Performance
                'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],  // 3s FCP
                'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }], // 4s LCP (Three.js)
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],  // CLS < 0.1
                'total-blocking-time': ['warn', { maxNumericValue: 600 }],       // TBT < 600ms
                'interactive': ['warn', { maxNumericValue: 5000 }],              // TTI < 5s
                'speed-index': ['warn', { maxNumericValue: 4500 }],              // SI < 4.5s

                // Accessibility
                'categories:accessibility': ['error', { minScore: 0.85 }],       // 85%+ a11y

                // Best Practices
                'categories:best-practices': ['warn', { minScore: 0.85 }],       // 85%+ best practices

                // SEO
                'categories:seo': ['warn', { minScore: 0.85 }],                  // 85%+ SEO

                // Specific assertions
                'uses-text-compression': 'warn',          // Gzip/Brotli
                'uses-responsive-images': 'warn',         // Responsive images
                'dom-size': ['warn', { maxNumericValue: 1500 }], // DOM elements < 1500
                'render-blocking-resources': 'warn',       // Minimize render-blocking
            },
        },
        upload: {
            // Store reports locally (switch to Lighthouse CI Server for team use)
            target: 'filesystem',
            outputDir: './qa/lighthouse-reports',
        },
    },
};
