const { test, expect } = require('@playwright/test');

const BASE = 'http://127.0.0.1:5173';

// Helper function to login via UI
async function loginViaUI(page) {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    
    // Navigate to admin login
    await page.goto(`${BASE}/shashwatam-control-2026/login`);
    await page.waitForTimeout(1000);
    
    // Fill login form
    await page.fill('input[type="text"], input[name="username"]', 'admin');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Login")');
    await page.waitForTimeout(2000);
}

// Quick UI validation tests for the new scoring pages
test.describe('📱 Scoring UI Validation', () => {

    test('Admin scoring table page loads', async ({ page }) => {
        await loginViaUI(page);
        const basePath = page.url().split('/').slice(0, 4).join('/');
        await page.goto(`${basePath}/scoring-presets`);
        await page.waitForTimeout(3000);
        
        // Should show the new "Official Scoring Table" page
        const heading = page.locator('text=Official Scoring Table').first();
        await expect(heading).toBeVisible({ timeout: 8000 });
        
        // Should show stats with 78 events
        const stat = page.locator('text=78').first();
        await expect(stat).toBeVisible({ timeout: 5000 });
    });

    test('Admin sidebar has updated nav items', async ({ page }) => {
        await loginViaUI(page);
        await page.waitForTimeout(2000);
        
        // Should have "Scoring Table" (renamed from "Scoring Presets")
        const scoringTableLink = page.locator('text=Scoring Table').first();
        await expect(scoringTableLink).toBeVisible({ timeout: 5000 });
        
        // Should have new "Bracket Manager" 
        const bracketLink = page.locator('text=Bracket Manager').first();
        await expect(bracketLink).toBeVisible({ timeout: 5000 });
    });

    test('Bracket manager page loads', async ({ page }) => {
        await loginViaUI(page);
        const basePath = page.url().split('/').slice(0, 4).join('/');
        await page.goto(`${basePath}/bracket-manager`);
        await page.waitForTimeout(3000);
        
        // Should show bracket manager UI
        const heading = page.locator('text=Bracket Manager').first();
        await expect(heading).toBeVisible({ timeout: 8000 });
        
        // Should have event selector dropdown
        const select = page.locator('select').first();
        await expect(select).toBeVisible({ timeout: 5000 });
    });

    test('Official scoring table shows events and filters', async ({ page }) => {
        await loginViaUI(page);
        const basePath = page.url().split('/').slice(0, 4).join('/');
        await page.goto(`${basePath}/scoring-presets`);
        await page.waitForTimeout(4000);
        
        // Should show filter buttons
        const bracketBtn = page.locator('button:has-text("Bracket")').first();
        const groupBtn = page.locator('button:has-text("Group")').first();
        await expect(bracketBtn).toBeVisible({ timeout: 5000 });
        await expect(groupBtn).toBeVisible({ timeout: 5000 });
        
        // Should show P1-P8 columns
        const p1Header = page.locator('th:has-text("P1"), text=P1').first();
        await expect(p1Header).toBeVisible({ timeout: 5000 });
        
        // Should have Bracket Manager link
        const bmBtn = page.locator('button:has-text("Bracket Manager"), a:has-text("Bracket Manager")').first();
        await expect(bmBtn).toBeVisible({ timeout: 5000 });
    });

    test('Events page has rank assignment buttons', async ({ page }) => {
        await loginViaUI(page);
        const basePath = page.url().split('/').slice(0, 4).join('/');
        await page.goto(`${basePath}/events`);
        await page.waitForTimeout(3000);
        
        // Should show events list
        const heading = page.locator('text=Event Manager').first();
        await expect(heading).toBeVisible({ timeout: 8000 });
        
        // Should have trophy (rank assignment) buttons on event cards
        const trophyBtns = page.locator('button[title="Assign Official Ranks"]');
        const count = await trophyBtns.count();
        expect(count).toBeGreaterThan(0);
    });
});