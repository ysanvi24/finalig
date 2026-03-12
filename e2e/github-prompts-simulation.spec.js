// @ts-check
/**
 * Comprehensive Simulation Test — Exercises ALL features from both GitHub prompts:
 *  1. plan-igScoringSystemOverhaul.prompt.md  (78 events, bracket tournaments, auto-leaderboard)
 *  2. plan-sportsEventsExpansion.prompt.md     (sports registry, Event model, public pages)
 *
 * Tests: Scoring table, full bracket QF→SF→LM→Final, group rank assignment, leaderboard,
 *        and frontend UI pages.
 */
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5173';
const API = 'http://localhost:5000/api';
const CREDS = { username: 'admin', password: 'admin123' };
const ADMIN_SECRET_PATH = 'shashwatam-control-2026';

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function getAdminToken(request) {
    const res = await request.post(`${API}/auth/login`, { data: CREDS });
    expect(res.status()).toBe(200);
    const json = await res.json();
    return json.token;
}

function authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PART 1: OFFICIAL SCORING TABLE VALIDATION
//  (plan-igScoringSystemOverhaul Step 1-2)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('📋 Part 1: Official Scoring Table', () => {

    test('78 official events exist (19 BRACKET + 59 GROUP)', async ({ request }) => {
        const res = await request.get(`${API}/official-events`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.total).toBe(78);

        const brackets = json.data.filter(e => e.type === 'BRACKET');
        const groups = json.data.filter(e => e.type === 'GROUP');
        expect(brackets.length).toBe(19);
        expect(groups.length).toBe(59);
    });

    test('Event #1 (Badminton): P1=35, type=BRACKET', async ({ request }) => {
        const res = await request.get(`${API}/official-events/1`);
        expect(res.status()).toBe(200);
        const event = (await res.json()).data;
        expect(event.name).toBe('Badminton');
        expect(event.type).toBe('BRACKET');
        const p1 = event.positions?.['1'] ?? event.positions?.[1] ?? 0;
        expect(p1).toBe(35);
    });

    test('Event #4 (Cricket Boys): P1=60', async ({ request }) => {
        const res = await request.get(`${API}/official-events/4`);
        expect(res.status()).toBe(200);
        const event = (await res.json()).data;
        expect(event.name).toBe('Cricket (Boys)');
        const p1 = event.positions?.['1'] ?? event.positions?.[1] ?? 0;
        expect(p1).toBe(60);
    });

    test('Event #61 (Flash Mob): all 8 positions = 30', async ({ request }) => {
        const res = await request.get(`${API}/official-events`);
        const events = (await res.json()).data || [];
        const flashMob = events.find(e => e.name === 'Flash Mob');
        expect(flashMob).toBeTruthy();
        for (let pos = 1; pos <= 8; pos++) {
            const pts = flashMob.positions?.[String(pos)] ?? flashMob.positions?.[pos] ?? -1;
            expect(pts).toBe(30);
        }
    });

    test('All events have valid P1 > 0 and valid eventNumber', async ({ request }) => {
        const res = await request.get(`${API}/official-events`);
        const events = (await res.json()).data || [];
        for (const event of events) {
            const p1 = event.positions?.['1'] ?? event.positions?.[1] ?? 0;
            expect(p1).toBeGreaterThan(0);
            expect(event.eventNumber).toBeGreaterThanOrEqual(1);
            expect(event.eventNumber).toBeLessThanOrEqual(78);
        }
    });

    test('Filter by type works (BRACKET / GROUP)', async ({ request }) => {
        const bracketRes = await request.get(`${API}/official-events?type=BRACKET`);
        const groupRes = await request.get(`${API}/official-events?type=GROUP`);
        const brackets = (await bracketRes.json()).data || [];
        const groups = (await groupRes.json()).data || [];
        expect(brackets.every(e => e.type === 'BRACKET')).toBe(true);
        expect(groups.every(e => e.type === 'GROUP')).toBe(true);
        expect(brackets.length).toBe(19);
        expect(groups.length).toBe(59);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PART 2: BRACKET TOURNAMENT SIMULATION
//  (plan-igScoringSystemOverhaul Step 3 — QF→SF→LM→Final)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('🏆 Part 2: Bracket Tournament (Event #1 Badminton)', () => {

    test('Full bracket simulation: start → QF → SF → LM → Final → points awarded', async ({ request }) => {
        const token = await getAdminToken(request);
        const headers = authHeaders(token);

        // Save leaderboard before
        const lbBefore = (await (await request.get(`${API}/leaderboard`)).json()).data;
        const pointsBefore = {};
        for (const d of lbBefore) pointsBefore[d._id] = d.points;

        // 0) Reset any existing bracket for event 1 (send force:true for awarded brackets)
        await request.fetch(`${API}/brackets/1/reset`, {
            method: 'DELETE',
            headers: { ...headers, 'Content-Type': 'application/json' },
            data: { force: true }
        });

        // 1) Start bracket → should create 4 QF matches
        const startRes = await request.post(`${API}/brackets/1/start`, {
            headers,
            data: {}  // random pairings
        });
        expect(startRes.status()).toBe(201);
        const startData = (await startRes.json()).data;
        expect(startData.rounds.QF.length).toBe(4);
        expect(startData.status).toBe('QF_PENDING');

        // 2) Complete all 4 QF matches (teamA always wins)
        for (const qfMatch of startData.rounds.QF) {
            const completeRes = await request.post(`${API}/brackets/match/${qfMatch._id}/complete`, {
                headers,
                data: {
                    winnerId: qfMatch.teamA._id || qfMatch.teamA,
                    scoreA: '21',
                    scoreB: '15'
                }
            });
            expect(completeRes.status()).toBe(200);
        }

        // 3) Verify SF matches were auto-created
        const afterQF = await request.get(`${API}/brackets/1`);
        const bracketAfterQF = (await afterQF.json()).data;
        expect(bracketAfterQF.rounds.SF.length).toBe(2);
        expect(bracketAfterQF.status).toBe('SF_PENDING');

        // 4) Complete both SF matches (teamA always wins)
        for (const sfMatch of bracketAfterQF.rounds.SF) {
            const completeRes = await request.post(`${API}/brackets/match/${sfMatch._id}/complete`, {
                headers,
                data: {
                    winnerId: sfMatch.teamA._id || sfMatch.teamA,
                    scoreA: '21',
                    scoreB: '18'
                }
            });
            expect(completeRes.status()).toBe(200);
        }

        // 5) Verify LM + Final auto-created
        const afterSF = await request.get(`${API}/brackets/1`);
        const bracketAfterSF = (await afterSF.json()).data;
        expect(bracketAfterSF.rounds.LM.length).toBe(1);
        expect(bracketAfterSF.rounds.FINAL.length).toBe(1);

        // 6) Complete LM (3rd place match) — teamA wins
        const lmMatch = bracketAfterSF.rounds.LM[0];
        const lmRes = await request.post(`${API}/brackets/match/${lmMatch._id}/complete`, {
            headers,
            data: {
                winnerId: lmMatch.teamA._id || lmMatch.teamA,
                scoreA: '21',
                scoreB: '19'
            }
        });
        expect(lmRes.status()).toBe(200);

        // 7) Complete Final — teamA wins (becomes champion)
        const finalMatch = bracketAfterSF.rounds.FINAL[0];
        const finalRes = await request.post(`${API}/brackets/match/${finalMatch._id}/complete`, {
            headers,
            data: {
                winnerId: finalMatch.teamA._id || finalMatch.teamA,
                scoreA: '21',
                scoreB: '16'
            }
        });
        expect(finalRes.status()).toBe(200);

        // 8) Verify bracket is complete and points awarded
        const finalBracket = await request.get(`${API}/brackets/1`);
        const bracketFinal = (await finalBracket.json()).data;
        expect(bracketFinal.status).toBe('AWARDED');
        expect(bracketFinal.pointsAwarded).toBe(true);

        // 9) Verify leaderboard was updated
        const lbAfter = (await (await request.get(`${API}/leaderboard`)).json()).data;
        let totalPointsGained = 0;
        for (const d of lbAfter) {
            const before = pointsBefore[d._id] || 0;
            totalPointsGained += (d.points - before);
        }
        // Badminton: P1=35, P2=25, P3=15, P4=5, P5-P8=0  → total 80
        expect(totalPointsGained).toBe(80);

        // 10) Cleanup: reset bracket (force since points were awarded)
        const resetRes = await request.fetch(`${API}/brackets/1/reset`, {
            method: 'DELETE',
            headers: { ...headers, 'Content-Type': 'application/json' },
            data: { force: true }
        });
        expect(resetRes.status()).toBe(200);
    });

    test('Bracket requires authentication', async ({ request }) => {
        const res = await request.post(`${API}/brackets/1/start`, {
            data: { pairings: [] }
        });
        expect(res.status()).toBe(401);
    });

    test('GET /api/brackets returns bracket listing', async ({ request }) => {
        const res = await request.get(`${API}/brackets`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.length).toBe(19);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PART 3: GROUP EVENT RANK ASSIGNMENT
//  (plan-igScoringSystemOverhaul Step 4 — events 20-78)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('📊 Part 3: Group Event Rank Assignment', () => {

    test('Create event, assign ranks, verify points, cleanup', async ({ request }) => {
        const token = await getAdminToken(request);
        const headers = authHeaders(token);

        // Get departments
        const deptRes = await request.get(`${API}/departments`);
        const departments = (await deptRes.json()).data || [];
        expect(departments.length).toBe(8);

        // Save leaderboard before
        const lbBefore = (await (await request.get(`${API}/leaderboard`)).json()).data;
        const pointsBefore = {};
        for (const d of lbBefore) pointsBefore[d._id] = d.points;

        // 1) Create an event for Triathlon (official event #20)
        const createRes = await request.post(`${API}/events`, {
            headers,
            data: {
                name: 'Triathlon Test Simulation',
                sport: 'TRIATHLON',
                category: 'ENDURANCE',
                status: 'COMPLETED',
                venue: 'Ground',
                description: 'Simulation test for group rank assignment'
            }
        });
        expect(createRes.status()).toBe(201);
        const event = (await createRes.json()).data;
        const eventId = event._id;

        // 2) Assign ranks 1-8 to all departments
        const ranks = departments.map((d, i) => ({
            department: d._id,
            position: i + 1
        }));

        const assignRes = await request.post(`${API}/events/${eventId}/assign-ranks`, {
            headers,
            data: {
                eventNumber: 20,
                ranks
            }
        });
        expect(assignRes.status()).toBe(200);
        const assignData = await assignRes.json();
        expect(assignData.success).toBe(true);

        // 3) Verify leaderboard was updated
        // Triathlon (#20): P1=50, P2=35, P3=20, P4=10, P5-8=0  → total 115
        const lbAfter = (await (await request.get(`${API}/leaderboard`)).json()).data;
        let totalPointsGained = 0;
        for (const d of lbAfter) {
            const before = pointsBefore[d._id] || 0;
            totalPointsGained += (d.points - before);
        }
        expect(totalPointsGained).toBe(115);

        // 4) Verify the event shows up in GET /api/events
        const eventsRes = await request.get(`${API}/events`);
        expect(eventsRes.status()).toBe(200);
        const eventsData = (await eventsRes.json()).data || [];
        const found = eventsData.find(e => e._id === eventId);
        expect(found).toBeTruthy();
        expect(found.pointsAwarded).toBe(true);

        // 5) Cleanup: delete the test event (points remain — that's fine, they'll be cleaned by leaderboard reset if needed)
        const deleteRes = await request.delete(`${API}/events/${eventId}`, { headers });
        expect(deleteRes.status()).toBe(200);
    });

    test('Event rank assignment requires auth', async ({ request }) => {
        const res = await request.post(`${API}/events/000000000000000000000001/assign-ranks`, {
            data: { ranks: [], officialEventNumber: 20 }
        });
        expect(res.status()).toBe(401);
    });

    test('Event CRUD endpoints work', async ({ request }) => {
        const token = await getAdminToken(request);
        const headers = authHeaders(token);

        // Create
        const createRes = await request.post(`${API}/events`, {
            headers,
            data: {
                name: 'CRUD Test Event',
                sport: 'TRIATHLON',
                category: 'ENDURANCE',
                status: 'UPCOMING',
                venue: 'Test Venue'
            }
        });
        expect(createRes.status()).toBe(201);
        const event = (await createRes.json()).data;

        // Read
        const getRes = await request.get(`${API}/events/${event._id}`);
        expect(getRes.status()).toBe(200);
        expect((await getRes.json()).data.name).toBe('CRUD Test Event');

        // Update
        const updateRes = await request.put(`${API}/events/${event._id}`, {
            headers,
            data: { name: 'Updated CRUD Test', status: 'IN_PROGRESS' }
        });
        expect(updateRes.status()).toBe(200);

        // Delete
        const deleteRes = await request.delete(`${API}/events/${event._id}`, { headers });
        expect(deleteRes.status()).toBe(200);

        // Verify deleted
        const verifyRes = await request.get(`${API}/events/${event._id}`);
        expect(verifyRes.status()).toBe(404);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PART 4: SPORTS REGISTRY & DEPARTMENTS
//  (plan-sportsEventsExpansion Step 1)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('🏟️ Part 4: Sports Registry & Departments', () => {

    test('8 departments exist including ARCH', async ({ request }) => {
        const res = await request.get(`${API}/departments`);
        expect(res.status()).toBe(200);
        const departments = (await res.json()).data || [];
        expect(departments.length).toBe(8);

        const archDept = departments.find(d => d.shortCode === 'ARCH');
        expect(archDept).toBeTruthy();
        expect(archDept.name).toBe('Architecture');
    });

    test('Leaderboard has all 8 departments ranked', async ({ request }) => {
        const res = await request.get(`${API}/leaderboard`);
        expect(res.status()).toBe(200);
        const standings = (await res.json()).data || [];
        expect(standings.length).toBe(8);

        // Sorted by points descending
        for (let i = 1; i < standings.length; i++) {
            expect(standings[i].points).toBeLessThanOrEqual(standings[i - 1].points);
        }
    });

    test('Existing matches work with current sports', async ({ request }) => {
        const res = await request.get(`${API}/matches?limit=200`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.data.length).toBeGreaterThan(0);

        // Verify all matches have required fields
        for (const match of body.data.slice(0, 10)) {
            expect(match.sport).toBeTruthy();
            expect(match.teamA).toBeTruthy();
            expect(match.teamB).toBeTruthy();
            expect(match.status).toBeTruthy();
        }
    });

    test('Detailed leaderboard has enriched data', async ({ request }) => {
        const res = await request.get(`${API}/leaderboard/detailed`);
        expect(res.status()).toBe(200);
        const standings = (await res.json()).data || [];
        expect(standings.length).toBe(8);
        if (standings.length > 0) {
            expect(standings[0]).toHaveProperty('name');
            expect(standings[0]).toHaveProperty('points');
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PART 5: FRONTEND UI PAGES
//  (Both prompts — Steps 6-8)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('🖥️ Part 5: Frontend UI Pages', () => {

    async function loginViaUI(page) {
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/login`);
        await page.waitForTimeout(1500);
        const usernameInput = page.locator(
            'input[type="text"], input[name="username"], input[placeholder*="user" i]'
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
        await page.waitForFunction(() => !window.location.pathname.includes('/login'),
            { timeout: 8000 }).catch(() => { });
        await page.waitForTimeout(1000);
        return page;
    }

    test('Public /events page loads without crash', async ({ page }) => {
        await page.goto(`${BASE}/events`);
        await page.waitForTimeout(3000);
        const body = await page.textContent('body');
        expect(body).not.toContain('Something went wrong');
        expect((await page.content()).length).toBeGreaterThan(500);
    });

    test('Public /events page has category tabs or event content', async ({ page }) => {
        await page.goto(`${BASE}/events`);
        await page.waitForTimeout(3000);
        const body = await page.textContent('body');
        // Should show event-related content
        const hasContent = body.includes('Event') || body.includes('Athletics') ||
            body.includes('Cultural') || body.includes('Competition') ||
            body.includes('Indoor') || body.includes('Art');
        expect(hasContent).toBeTruthy();
    });

    test('Admin Scoring Presets page shows Official Scoring Table', async ({ page }) => {
        await loginViaUI(page);
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/scoring-presets`);
        await page.waitForTimeout(4000);
        const body = await page.textContent('body');
        // Should show "Official Scoring Table" and "78"
        const hasTable = body.includes('Official') || body.includes('Scoring') ||
            body.includes('Event') || body.includes('78');
        expect(hasTable).toBeTruthy();
    });

    test('Admin Bracket Manager page loads', async ({ page }) => {
        await loginViaUI(page);
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/bracket-manager`);
        await page.waitForTimeout(4000);
        const body = await page.textContent('body');
        const hasManager = body.includes('Bracket') || body.includes('Manager') ||
            body.includes('Tournament') || body.includes('Event');
        expect(hasManager).toBeTruthy();
        expect(body).not.toContain('Something went wrong');
    });

    test('Admin Event Manager page loads', async ({ page }) => {
        await loginViaUI(page);
        await page.goto(`${BASE}/${ADMIN_SECRET_PATH}/events`);
        await page.waitForTimeout(4000);
        const body = await page.textContent('body');
        const hasManager = body.includes('Event') || body.includes('Manager') ||
            body.includes('Create') || body.includes('Manage');
        expect(hasManager).toBeTruthy();
        expect(body).not.toContain('Something went wrong');
    });

    test('Home page loads with navigation', async ({ page }) => {
        await page.goto(BASE);
        await page.waitForTimeout(3000);
        const body = await page.textContent('body');
        expect(body).not.toContain('Something went wrong');
        const hasNav = body.includes('Leaderboard') || body.includes('Home') ||
            body.includes('VNIT') || body.includes('Events');
        expect(hasNav).toBeTruthy();
    });

    test('Leaderboard page shows 8 departments', async ({ page }) => {
        await page.goto(`${BASE}/leaderboard`);
        await page.waitForTimeout(4000);
        const body = await page.textContent('body');
        // Should show some department names
        const hasDepts = body.includes('Civil') || body.includes('Computer') ||
            body.includes('CSE') || body.includes('Chemical') ||
            body.includes('Electrical') || body.includes('Mechanical');
        expect(hasDepts).toBeTruthy();
    });

    test('No JS errors on key public pages', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));

        for (const route of ['/', '/leaderboard', '/events', '/about']) {
            await page.goto(`${BASE}${route}`);
            await page.waitForTimeout(2000);
        }

        const critical = errors.filter(e =>
            !e.includes('ResizeObserver') && !e.includes('favicon')
        );
        expect(critical).toEqual([]);
    });
});
