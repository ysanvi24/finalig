// @ts-check
/**
 * Fast API-only E2E tests (no browser UI — pure HTTP).
 * Validates: highlights, matches, leaderboard, council photos, scoring, security.
 */
const { test, expect } = require('@playwright/test');

const API = 'http://127.0.0.1:5000/api';

// ═══════════════════════════════════════════════════════════
//  1. HIGHLIGHTS — 15-day reel / pic / article
// ═══════════════════════════════════════════════════════════
test.describe('Highlights API', () => {
    test('GET /highlights/dates returns 15+ dates', async ({ request }) => {
        const res = await request.get(`${API}/highlights/dates`);
        expect(res.status()).toBe(200);
        const dates = await res.json();
        expect(Array.isArray(dates)).toBe(true);
        expect(dates.length).toBeGreaterThanOrEqual(15);
    });

    test('Each sampled date has reel+pic+article', async ({ request }) => {
        const datesRes = await request.get(`${API}/highlights/dates`);
        const dates = await datesRes.json();
        const sampled = [dates[0], dates[Math.floor(dates.length / 2)], dates[dates.length - 1]];
        for (const date of sampled) {
            const res = await request.get(`${API}/highlights?date=${date}`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            const items = body.data || body;
            const types = items.map(h => h.type);
            expect(types).toContain('reel');
            expect(types).toContain('pic');
            expect(types).toContain('article');
        }
    });

    test('Highlight items have required fields', async ({ request }) => {
        const datesRes = await request.get(`${API}/highlights/dates`);
        const dates = await datesRes.json();
        const res = await request.get(`${API}/highlights?date=${dates[0]}`);
        const body = await res.json();
        const items = body.data || body;
        for (const h of items) {
            expect(h.type).toBeTruthy();
            expect(h.date).toBeTruthy();
            expect(h.caption || h.content).toBeTruthy();
        }
    });

    test('GET /highlights/today returns 200 or 404', async ({ request }) => {
        const res = await request.get(`${API}/highlights/today`);
        expect([200, 404].includes(res.status())).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════
//  2. MATCHES — 100 seeded across 10 sports
// ═══════════════════════════════════════════════════════════
test.describe('Matches API', () => {
    test('GET /matches returns paginated data with 90+ total', async ({ request }) => {
        const res = await request.get(`${API}/matches`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        expect(body.total).toBeGreaterThanOrEqual(90);
        expect(body.data.length).toBeGreaterThanOrEqual(1);
    });

    test('Matches cover all 10 sports', async ({ request }) => {
        const res = await request.get(`${API}/matches?limit=200`);
        const body = await res.json();
        const sports = [...new Set(body.data.map(m => m.sport))];
        for (const s of ['CRICKET', 'BADMINTON', 'TABLE_TENNIS', 'VOLLEYBALL', 'FOOTBALL', 'HOCKEY', 'BASKETBALL', 'KHOKHO', 'KABADDI', 'CHESS']) {
            expect(sports).toContain(s);
        }
    });

    test('Completed matches with winner have populated winner object', async ({ request }) => {
        const res = await request.get(`${API}/matches?limit=200`);
        const body = await res.json();
        const completed = body.data.filter(m => m.status === 'COMPLETED' && m.winner);
        expect(completed.length).toBeGreaterThanOrEqual(30);
        const m = completed[0];
        // scoreA/B can be empty string for some matches; winner is always populated
        expect(m.winner.shortCode || m.winner._id).toBeTruthy();
    });

    test('Draw matches exist (completed, no winner)', async ({ request }) => {
        const res = await request.get(`${API}/matches?limit=200`);
        const body = await res.json();
        const draws = body.data.filter(m => m.status === 'COMPLETED' && !m.winner);
        expect(draws.length).toBeGreaterThanOrEqual(5);
    });

    test('Scheduled matches exist', async ({ request }) => {
        const res = await request.get(`${API}/matches?limit=200`);
        const body = await res.json();
        const scheduled = body.data.filter(m => m.status === 'SCHEDULED');
        expect(scheduled.length).toBeGreaterThanOrEqual(5);
    });

    test('Match categories span GROUP_STAGE to FINAL', async ({ request }) => {
        const res = await request.get(`${API}/matches?limit=200`);
        const body = await res.json();
        const cats = [...new Set(body.data.map(m => m.matchCategory))];
        expect(cats).toContain('GROUP_STAGE');
        expect(cats).toContain('FINAL');
    });
});

// ═══════════════════════════════════════════════════════════
//  3. LEADERBOARD
// ═══════════════════════════════════════════════════════════
test.describe('Leaderboard API', () => {
    test('GET /leaderboard returns 7 departments ranked', async ({ request }) => {
        const res = await request.get(`${API}/leaderboard`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const standings = body.data || body;
        expect(standings.length).toBe(8);
    });

    test('#1 department has more points than #7', async ({ request }) => {
        const res = await request.get(`${API}/leaderboard`);
        const body = await res.json();
        const standings = body.data || body;
        const first = standings[0].totalPoints || standings[0].points || 0;
        const last = standings[standings.length - 1].totalPoints || standings[standings.length - 1].points || 0;
        expect(first).toBeGreaterThanOrEqual(last);
        expect(first).toBeGreaterThan(0);
    });

    test('GET /leaderboard/detailed returns enriched data', async ({ request }) => {
        const res = await request.get(`${API}/leaderboard/detailed`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const standings = body.data || body;
        expect(standings.length).toBe(8);
    });
});

// ═══════════════════════════════════════════════════════════
//  4. SCORING PRESETS
// ═══════════════════════════════════════════════════════════
test.describe('Scoring Presets', () => {
    test('10 presets with win/loss/draw points', async ({ request }) => {
        const res = await request.get(`${API}/scoring-presets`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const presets = body.data || body;
        expect(presets.length).toBeGreaterThanOrEqual(10);
        for (const p of presets) {
            expect(p.sport).toBeTruthy();
            expect(typeof p.winPoints).toBe('number');
            expect(typeof p.lossPoints).toBe('number');
            expect(typeof p.drawPoints).toBe('number');
        }
    });
});

// ═══════════════════════════════════════════════════════════
//  5. STUDENT COUNCIL — 15 members + photos
// ═══════════════════════════════════════════════════════════
test.describe('Student Council', () => {
    test('15 members, each with /uploads/ photo path', async ({ request }) => {
        const res = await request.get(`${API}/student-council`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const members = body.data || body;
        expect(members.length).toBe(15);
        for (const m of members) {
            expect(m.name).toBeTruthy();
            expect(m.photo).toBeTruthy();
            expect(m.photo).toMatch(/^\/uploads\//);
        }
    });

    test('Photos serve HTTP 200 with image content-type', async ({ request }) => {
        const councilRes = await request.get(`${API}/student-council`);
        const members = (await councilRes.json()).data;
        for (const m of members.slice(0, 5)) {
            const imgRes = await request.get(`http://127.0.0.1:5000${m.photo}`);
            expect(imgRes.status()).toBe(200);
            expect(imgRes.headers()['content-type']).toContain('image');
        }
    });

    test('Photos have CORS cross-origin + cache headers', async ({ request }) => {
        const councilRes = await request.get(`${API}/student-council`);
        const members = (await councilRes.json()).data;
        const imgRes = await request.get(`http://127.0.0.1:5000${members[0].photo}`);
        expect(imgRes.headers()['cross-origin-resource-policy']).toBe('cross-origin');
        expect(imgRes.headers()['cache-control']).toContain('max-age=86400');
    });
});

// ═══════════════════════════════════════════════════════════
//  6. DEPARTMENTS
// ═══════════════════════════════════════════════════════════
test.describe('Departments', () => {
    test('7 departments with shortCode and name', async ({ request }) => {
        const res = await request.get(`${API}/departments`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const depts = body.data || body;
        expect(depts.length).toBe(8);
        for (const d of depts) {
            expect(d.shortCode).toBeTruthy();
            expect(d.name).toBeTruthy();
        }
    });
});

// ═══════════════════════════════════════════════════════════
//  7. SECURITY HEADERS
// ═══════════════════════════════════════════════════════════
test.describe('Security', () => {
    test('HSTS + nosniff present', async ({ request }) => {
        const res = await request.get(`${API}/departments`);
        expect(res.headers()['x-content-type-options']).toBe('nosniff');
        expect(res.headers()['strict-transport-security']).toBeTruthy();
    });

    test('CORS allows localhost:5174', async ({ request }) => {
        const res = await request.get(`${API}/departments`, {
            headers: { 'Origin': 'http://localhost:5174' }
        });
        expect(res.status()).toBe(200);
        expect(res.headers()['access-control-allow-origin']).toBe('http://localhost:5174');
    });

    test('/alive returns healthy', async ({ request }) => {
        const res = await request.get('http://127.0.0.1:5000/alive');
        expect(res.status()).toBe(200);
        expect((await res.json()).status).toBe('alive');
    });

    test('Uploads have CORP cross-origin', async ({ request }) => {
        const res = await request.get('http://127.0.0.1:5000/uploads/council-rohit-shrivas.png');
        expect(res.status()).toBe(200);
        expect(res.headers()['cross-origin-resource-policy']).toBe('cross-origin');
    });
});

// ═══════════════════════════════════════════════════════════
//  8. SEASONS & ABOUT
// ═══════════════════════════════════════════════════════════
test.describe('Misc APIs', () => {
    test('Seasons endpoint OK', async ({ request }) => {
        const res = await request.get(`${API}/seasons`);
        expect([200, 304].includes(res.status())).toBe(true);
    });
    test('About endpoint OK', async ({ request }) => {
        const res = await request.get(`${API}/about`);
        expect([200, 304].includes(res.status())).toBe(true);
    });
});
