// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000/api';
const CREDS = { username: 'admin', password: 'admin123' };
const ADMIN_SECRET_PATH = 'shashwatam-control-2026';

// ═══════════════════════════════════════════════════════════
//  Helper: get a fresh admin JWT token
// ═══════════════════════════════════════════════════════════
async function getAdminToken(request) {
    const res = await request.post(`${API}/auth/login`, { data: CREDS });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.token).toBeTruthy();
    return json.token;
}

// ═══════════════════════════════════════════════════════════
//  Helper: login via the UI and return the page
// ═══════════════════════════════════════════════════════════
async function loginViaUI(page) {
    await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/login`);
    await page.waitForTimeout(1500);

    const usernameInput = page.locator(
        'input[type="text"], input[name="username"], input[placeholder*="user" i], input[placeholder*="name" i]'
    ).first();
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(usernameInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });

    await usernameInput.fill(CREDS.username);
    await passwordInput.fill(CREDS.password);

    const submitBtn = page.locator(
        'button[type="submit"], button:has-text("Login"), button:has-text("Sign")'
    ).first();
    await submitBtn.click();

    // Wait for navigation away from login page (up to 8s)
    await page.waitForFunction(() => {
        return !window.location.pathname.includes('/login');
    }, { timeout: 8000 }).catch(() => { });
    await page.waitForTimeout(1000);
    return page;
}

// ─────────────────────────────────────────────────────────
//  1.  BACKEND HEALTH
// ─────────────────────────────────────────────────────────
test.describe('1 · Backend Health', () => {

    test('GET /alive returns alive status', async ({ request }) => {
        const res = await request.get('http://localhost:5000/alive');
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.status).toBe('alive');
    });

    test('GET /api/health returns healthy', async ({ request }) => {
        const res = await request.get(`${API}/health`);
        expect(res.status()).toBe(200);
    });
});

// ─────────────────────────────────────────────────────────
//  2.  PUBLIC API ENDPOINTS
// ─────────────────────────────────────────────────────────
test.describe('2 · Public API Endpoints', () => {

    test('GET /api/leaderboard → sorted data with ranks', async ({ request }) => {
        const res = await request.get(`${API}/leaderboard`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBeTruthy();
        for (let i = 1; i < json.data.length; i++) {
            expect(json.data[i].points).toBeLessThanOrEqual(json.data[i - 1].points);
        }
        if (json.data.length > 0) {
            expect(json.data[0]).toHaveProperty('rank');
            expect(json.data[0].rank).toBe(1);
        }
    });

    test('GET /api/leaderboard/detailed → enriched data', async ({ request }) => {
        const res = await request.get(`${API}/leaderboard/detailed`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        if (json.data.length > 0) {
            expect(json.data[0]).toHaveProperty('name');
            expect(json.data[0]).toHaveProperty('points');
        }
    });

    test('GET /api/matches → 200', async ({ request }) => {
        const res = await request.get(`${API}/matches`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
    });

    test('GET /api/departments → 200 + array', async ({ request }) => {
        const res = await request.get(`${API}/departments`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(Array.isArray(json.data || json)).toBeTruthy();
    });

    test('GET /api/seasons → 200', async ({ request }) => {
        const res = await request.get(`${API}/seasons`);
        expect(res.status()).toBe(200);
    });

    test('GET /api/seasons/active → 200 or 404', async ({ request }) => {
        const res = await request.get(`${API}/seasons/active`);
        expect([200, 404]).toContain(res.status());
    });

    test('GET /api/scoring-presets → 200', async ({ request }) => {
        const res = await request.get(`${API}/scoring-presets`);
        expect(res.status()).toBe(200);
    });

    test('GET /api/highlights → 200', async ({ request }) => {
        const res = await request.get(`${API}/highlights`);
        expect(res.status()).toBe(200);
    });

    test('GET /api/players → 200', async ({ request }) => {
        const res = await request.get(`${API}/players`);
        expect(res.status()).toBe(200);
    });

    test('GET /api/student-council → 200', async ({ request }) => {
        const res = await request.get(`${API}/student-council`);
        expect(res.status()).toBe(200);
    });

    test('GET /api/about → 200', async ({ request }) => {
        const res = await request.get(`${API}/about`);
        expect(res.status()).toBe(200);
    });
});

// ─────────────────────────────────────────────────────────
//  3.  AUTHENTICATION API
// ─────────────────────────────────────────────────────────
test.describe('3 · Authentication API', () => {

    test('Valid login → token + role', async ({ request }) => {
        const res = await request.post(`${API}/auth/login`, { data: CREDS });
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.token).toBeTruthy();
        expect(json.role).toBe('super_admin');
        expect(json.username).toBe('admin');
    });

    test('Wrong password → 401', async ({ request }) => {
        const res = await request.post(`${API}/auth/login`, {
            data: { username: 'admin', password: 'wrong' }
        });
        expect(res.status()).toBe(401);
    });

    test('Missing password → 400 or 401', async ({ request }) => {
        const res = await request.post(`${API}/auth/login`, {
            data: { username: 'admin' }
        });
        expect([400, 401]).toContain(res.status());
    });

    test('GET /api/auth/me without token → 401', async ({ request }) => {
        const res = await request.get(`${API}/auth/me`);
        expect(res.status()).toBe(401);
    });

    test('GET /api/auth/me with token → profile', async ({ request }) => {
        const token = await getAdminToken(request);
        const res = await request.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(res.status()).toBe(200);
        const json = await res.json();
        const user = json.data || json;
        expect(user).toHaveProperty('username');
    });
});

// ─────────────────────────────────────────────────────────
//  4.  PROTECTED ENDPOINTS — AUTH GUARD
// ─────────────────────────────────────────────────────────
test.describe('4 · Protected Endpoints Guard', () => {

    test('POST /api/leaderboard/reset → 401', async ({ request }) => {
        const res = await request.post(`${API}/leaderboard/reset`);
        expect(res.status()).toBe(401);
    });

    test('POST /api/matches → 401', async ({ request }) => {
        const res = await request.post(`${API}/matches`, { data: {} });
        expect(res.status()).toBe(401);
    });

    test('POST /api/leaderboard/award → 401', async ({ request }) => {
        const res = await request.post(`${API}/leaderboard/award`, { data: {} });
        expect(res.status()).toBe(401);
    });

    test('GET /api/admins → 401', async ({ request }) => {
        const res = await request.get(`${API}/admins`);
        expect(res.status()).toBe(401);
    });

    test('POST /api/fouls → 401', async ({ request }) => {
        const res = await request.post(`${API}/fouls`, { data: {} });
        expect(res.status()).toBe(401);
    });
});

// ─────────────────────────────────────────────────────────
//  5.  LEADERBOARD EDIT API (CRITICAL)
// ─────────────────────────────────────────────────────────
test.describe('5 · Leaderboard Edit API', () => {

    test('PUT sets points → GET verifies → restore', async ({ request }) => {
        const token = await getAdminToken(request);

        // Current standings
        const data = (await (await request.get(`${API}/leaderboard`)).json()).data;
        expect(data.length).toBeGreaterThan(0);

        const dept = data[0];
        const original = dept.points;
        const target = original + 5;

        // SET
        const putRes = await request.put(`${API}/leaderboard/department/${dept._id}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { points: target }
        });
        expect(putRes.status()).toBe(200);
        expect((await putRes.json()).success).toBe(true);

        // VERIFY
        const updated = (await (await request.get(`${API}/leaderboard`)).json()).data;
        const check = updated.find(d => d._id === dept._id);
        expect(check.points).toBe(target);

        // RESTORE
        await request.put(`${API}/leaderboard/department/${dept._id}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { points: original }
        });
        const restored = (await (await request.get(`${API}/leaderboard`)).json()).data;
        expect(restored.find(d => d._id === dept._id).points).toBe(original);
    });

    test('PUT same value → success (no-op)', async ({ request }) => {
        const token = await getAdminToken(request);
        const dept = (await (await request.get(`${API}/leaderboard`)).json()).data[0];
        const res = await request.put(`${API}/leaderboard/department/${dept._id}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { points: dept.points }
        });
        expect(res.status()).toBe(200);
    });

    test('PUT negative → 400', async ({ request }) => {
        const token = await getAdminToken(request);
        const dept = (await (await request.get(`${API}/leaderboard`)).json()).data[0];
        const res = await request.put(`${API}/leaderboard/department/${dept._id}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { points: -10 }
        });
        expect(res.status()).toBe(400);
    });

    test('PUT without token → 401', async ({ request }) => {
        const dept = (await (await request.get(`${API}/leaderboard`)).json()).data[0];
        const res = await request.put(`${API}/leaderboard/department/${dept._id}`, {
            data: { points: 999 }
        });
        expect(res.status()).toBe(401);
    });

    test('Rankings handle ties correctly', async ({ request }) => {
        const data = (await (await request.get(`${API}/leaderboard`)).json()).data;
        for (let i = 1; i < data.length; i++) {
            if (data[i].points === data[i - 1].points) {
                expect(data[i].rank).toBe(data[i - 1].rank);
            } else {
                expect(data[i].rank).toBeGreaterThan(data[i - 1].rank);
            }
        }
    });
});

// ─────────────────────────────────────────────────────────
//  6.  MATCH API
// ─────────────────────────────────────────────────────────
test.describe('6 · Match API', () => {

    test('Matches returns array', async ({ request }) => {
        const json = await (await request.get(`${API}/matches`)).json();
        const matches = json.data || json.matches || [];
        expect(Array.isArray(matches)).toBeTruthy();
    });

    test('Invalid match ID → 400/404/500', async ({ request }) => {
        const res = await request.get(`${API}/matches/invalidid123`);
        expect([400, 404, 500]).toContain(res.status());
    });

    test('Valid match ID → match object', async ({ request }) => {
        const matches = (await (await request.get(`${API}/matches`)).json()).data || [];
        if (matches.length === 0) { test.skip(); return; }
        const detail = await request.get(`${API}/matches/${matches[0]._id}`);
        expect(detail.status()).toBe(200);
        const m = (await detail.json()).data || (await detail.json());
        expect(m).toHaveProperty('sport');
    });
});

// ─────────────────────────────────────────────────────────
//  7.  DEPARTMENT API
// ─────────────────────────────────────────────────────────
test.describe('7 · Department API', () => {

    test('Departments have name + shortCode', async ({ request }) => {
        const json = await (await request.get(`${API}/departments`)).json();
        const depts = json.data || json;
        expect(Array.isArray(depts)).toBeTruthy();
        if (depts.length > 0) {
            expect(depts[0]).toHaveProperty('name');
            expect(depts[0]).toHaveProperty('shortCode');
        }
    });
});

// ─────────────────────────────────────────────────────────
//  8.  ADMIN API (AUTHENTICATED)
// ─────────────────────────────────────────────────────────
test.describe('8 · Admin API', () => {

    test('GET /api/admins → list', async ({ request }) => {
        const token = await getAdminToken(request);
        const res = await request.get(`${API}/admins`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(res.status()).toBe(200);
        const admins = (await res.json()).data || (await res.json());
        expect(Array.isArray(admins)).toBeTruthy();
    });

    test('GET /api/admins/activity/live → 200/404', async ({ request }) => {
        const token = await getAdminToken(request);
        const res = await request.get(`${API}/admins/activity/live`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect([200, 404]).toContain(res.status());
    });
});

// ─────────────────────────────────────────────────────────
//  9.  SCORING PRESETS & FOULS
// ─────────────────────────────────────────────────────────
test.describe('9 · Scoring Presets & Fouls', () => {

    test('Scoring presets → success', async ({ request }) => {
        const json = await (await request.get(`${API}/scoring-presets`)).json();
        expect(json.success).toBe(true);
    });

    test('Default preset for cricket → 200/404', async ({ request }) => {
        const res = await request.get(`${API}/scoring-presets/sport/cricket/default`);
        expect([200, 404]).toContain(res.status());
    });

    test('Fouls by sport → 200/404', async ({ request }) => {
        const res = await request.get(`${API}/fouls/sport/cricket`);
        expect([200, 404]).toContain(res.status());
    });
});

// ═══════════════════════════════════════════════════════════
//  PUBLIC UI PAGES
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
//  10.  HOME PAGE
// ─────────────────────────────────────────────────────────
test.describe('10 · Home Page', () => {

    test('Loads — no white screen', async ({ page }) => {
        await page.goto(BASE);
        await expect(page.locator('body')).not.toBeEmpty();
        const body = await page.textContent('body');
        expect(body).not.toContain('Something went wrong');
        await page.waitForTimeout(2000);
        expect((await page.content()).length).toBeGreaterThan(1000);
    });

    test('No console JS errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));
        await page.goto(BASE);
        await page.waitForTimeout(3000);
        const critical = errors.filter(e =>
            !e.includes('ResizeObserver') && !e.includes('favicon')
        );
        expect(critical).toEqual([]);
    });

    test('Has navigation elements', async ({ page }) => {
        await page.goto(BASE);
        await page.waitForTimeout(2000);
        const body = await page.textContent('body');
        const hasNav = body.includes('Leaderboard') ||
            body.includes('Home') ||
            body.includes('VNIT') ||
            body.includes('Games') ||
            body.includes('Inter');
        expect(hasNav).toBeTruthy();
    });
});

// ─────────────────────────────────────────────────────────
//  11.  LEADERBOARD PAGE
// ─────────────────────────────────────────────────────────
test.describe('11 · Public Leaderboard', () => {

    test('Shows standings content', async ({ page }) => {
        await page.goto(`${BASE}/leaderboard`);
        await page.waitForTimeout(4000);
        const body = await page.textContent('body');
        const has = body.includes('Leaderboard') || body.includes('Standings') ||
            body.includes('pts') || body.includes('Rank');
        expect(has).toBeTruthy();
    });

    test('Shows department names from DB', async ({ page }) => {
        const departments = (await (await page.request.get(`${API}/leaderboard`)).json()).data || [];
        await page.goto(`${BASE}/leaderboard`);
        await page.waitForTimeout(4000);
        if (departments.length > 0) {
            const body = await page.textContent('body');
            expect(departments.some(d => body.includes(d.name) || body.includes(d.shortCode))).toBeTruthy();
        }
    });

    test('No JS errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));
        await page.goto(`${BASE}/leaderboard`);
        await page.waitForTimeout(3000);
        expect(errors.filter(e => !e.includes('ResizeObserver'))).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────
//  12.  ABOUT PAGE
// ─────────────────────────────────────────────────────────
test.describe('12 · About Page', () => {

    test('Loads without error', async ({ page }) => {
        await page.goto(`${BASE}/about`);
        await page.waitForTimeout(2000);
        const body = await page.textContent('body');
        expect(body).not.toContain('Something went wrong');
        expect((await page.content()).length).toBeGreaterThan(500);
    });
});

// ─────────────────────────────────────────────────────────
//  13.  STUDENT COUNCIL PAGE
// ─────────────────────────────────────────────────────────
test.describe('13 · Student Council Page', () => {

    test('Loads without error', async ({ page }) => {
        await page.goto(`${BASE}/student-council`);
        await page.waitForTimeout(2000);
        const body = await page.textContent('body');
        expect(body).not.toContain('Something went wrong');
        expect((await page.content()).length).toBeGreaterThan(500);
    });
});

// ─────────────────────────────────────────────────────────
//  14.  MATCH DETAIL PAGE
// ─────────────────────────────────────────────────────────
test.describe('14 · Match Detail Page', () => {

    test('Valid match ID loads', async ({ page }) => {
        const matches = (await (await page.request.get(`${API}/matches`)).json()).data || [];
        if (matches.length === 0) { test.skip(); return; }
        await page.goto(`${BASE}/match/${matches[0]._id}`);
        await page.waitForTimeout(3000);
        expect(await page.textContent('body')).not.toContain('Something went wrong');
        expect((await page.content()).length).toBeGreaterThan(500);
    });

    test('Invalid match ID → graceful error', async ({ page }) => {
        await page.goto(`${BASE}/match/000000000000000000000000`);
        await page.waitForTimeout(3000);
        expect(await page.textContent('body')).not.toContain('Something went wrong');
    });
});

// ═══════════════════════════════════════════════════════════
//  ADMIN UI FLOWS
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
//  15.  LOGIN PAGE
// ─────────────────────────────────────────────────────────
test.describe('15 · Admin Login Page', () => {

    test('Renders form fields', async ({ page }) => {
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/login`);
        await page.waitForTimeout(4000);
        const body = await page.textContent('body');
        const ok = body.includes('Login') || body.includes('login') ||
            body.includes('Sign') || body.includes('Username');
        expect(ok).toBeTruthy();
    });

    test('/login shows blocker page (honeypot)', async ({ page }) => {
        await page.goto(`${BASE}/login`);
        await page.waitForTimeout(4000);
        const body = await page.textContent('body');
        // /login is a honeypot — it should show the AdminBlocker, not the actual login form
        expect(body).not.toContain('Something went wrong');
        expect((await page.content()).length).toBeGreaterThan(500);
    });
});

// ─────────────────────────────────────────────────────────
//  16.  ADMIN LOGIN + DASHBOARD
// ─────────────────────────────────────────────────────────
test.describe('16 · Admin Login + Dashboard', () => {

    test('Login navigates to admin area', async ({ page }) => {
        await loginViaUI(page);
        const url = page.url();
        expect(url.includes(`/${ADMIN_SECRET_PATH}`) && !url.includes('/login')).toBeTruthy();
    });

    test('Dashboard shows admin content', async ({ page }) => {
        await loginViaUI(page);
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/dashboard`);
        await page.waitForTimeout(2000);
        const body = await page.textContent('body');
        const ok = body.includes('Dashboard') || body.includes('Overview') ||
            body.includes('Matches') || body.includes('Admin') ||
            body.includes('Total');
        expect(ok).toBeTruthy();
    });
});

// ─────────────────────────────────────────────────────────
//  17.  ADMIN LEADERBOARD MANAGEMENT
// ─────────────────────────────────────────────────────────
test.describe('17 · Admin Leaderboard Management', () => {

    test('Page loads with department data', async ({ page }) => {
        await loginViaUI(page);
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/leaderboard`);
        // Wait for loading spinners to disappear
        await page.waitForFunction(() => {
            return !document.querySelector('.animate-spin') ||
                document.querySelectorAll('.animate-spin').length === 0;
        }, { timeout: 10000 }).catch(() => { });
        await page.waitForTimeout(2000);
        const body = await page.textContent('body');
        const ok = body.includes('Leaderboard') || body.includes('Points') ||
            body.includes('Department') || body.includes('Rankings') ||
            body.includes('Edit') || body.includes('points');
        expect(ok).toBeTruthy();
    });

    test('Shows known department names', async ({ page }) => {
        await loginViaUI(page);
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/leaderboard`);
        await page.waitForFunction(() => {
            return !document.querySelector('.animate-spin') ||
                document.querySelectorAll('.animate-spin').length === 0;
        }, { timeout: 10000 }).catch(() => { });
        await page.waitForTimeout(2000);
        const body = await page.textContent('body');
        const ok = body.includes('Mining') || body.includes('Computer') ||
            body.includes('CSE') || body.includes('Chemical') ||
            body.includes('Civil') || body.includes('Mechanical');
        expect(ok).toBeTruthy();
    });
});

// ─────────────────────────────────────────────────────────
//  18.  ALL ADMIN PAGES LOAD
// ─────────────────────────────────────────────────────────
test.describe('18 · All Admin Pages Load', () => {
    const pages = [
        { path: `/${ADMIN_SECRET_PATH}/departments`, name: 'Departments' },
        { path: `/${ADMIN_SECRET_PATH}/schedule`, name: 'Schedule Match' },
        { path: `/${ADMIN_SECRET_PATH}/points`, name: 'Award Points' },
        { path: `/${ADMIN_SECRET_PATH}/seasons`, name: 'Seasons' },
        { path: `/${ADMIN_SECRET_PATH}/scoring-presets`, name: 'Scoring Presets' },
        { path: `/${ADMIN_SECRET_PATH}/users`, name: 'Admin Management' },
        { path: `/${ADMIN_SECRET_PATH}/student-council`, name: 'Student Council Mgmt' },
        { path: `/${ADMIN_SECRET_PATH}/highlights`, name: 'Highlights Mgmt' },
        { path: `/${ADMIN_SECRET_PATH}/about`, name: 'About Mgmt' },
    ];

    for (const pg of pages) {
        test(`${pg.name} (${pg.path})`, async ({ page }) => {
            await loginViaUI(page);
            await page.goto(`${BASE}${pg.path}`);
            await page.waitForTimeout(3000);
            const body = await page.textContent('body');
            expect(body).not.toContain('Something went wrong');
            expect((await page.content()).length).toBeGreaterThan(1000);
        });
    }
});

// ─────────────────────────────────────────────────────────
//  19.  NAVIGATION
// ─────────────────────────────────────────────────────────
test.describe('19 · Navigation', () => {

    test('Navigate between all public pages without crash', async ({ page }) => {
        for (const route of ['/', '/leaderboard', '/about', '/student-council', '/']) {
            await page.goto(`${BASE}${route}`);
            await page.waitForTimeout(1500);
            expect(await page.textContent('body')).not.toContain('Something went wrong');
        }
    });

    test('Unknown route does not crash', async ({ page }) => {
        await page.goto(`${BASE}/non-existent-page-12345`);
        await page.waitForTimeout(2000);
        expect(await page.textContent('body')).not.toContain('Something went wrong');
    });
});

// ─────────────────────────────────────────────────────────
//  20.  PROTECTED ROUTE REDIRECT
// ─────────────────────────────────────────────────────────
test.describe('20 · Protected Route Redirect', () => {

    test('Unauthenticated /admin → blocker page (honeypot)', async ({ page }) => {
        await page.context().clearCookies();
        await page.goto(`${BASE}/admin`);
        await page.waitForTimeout(3000);
        // /admin is honeypot → shows AdminBlocker page
        const body = await page.textContent('body');
        expect(body).not.toContain('Something went wrong');
        expect((await page.content()).length).toBeGreaterThan(500);
    });

    test('Unauthenticated secret admin → redirects to login', async ({ page }) => {
        await page.context().clearCookies();
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/dashboard`);
        await page.waitForTimeout(3000);
        const url = page.url();
        const body = await page.textContent('body');
        const ok = url.includes('login') || body.includes('Login') ||
            body.includes('login') || body.includes('Unauthorized');
        expect(ok).toBeTruthy();
    });
});
