// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './e2e',
    timeout: 30000,
    expect: { timeout: 10000 },
    fullyParallel: false,
    retries: 1,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:5173',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'on-first-retry',
    },
});
