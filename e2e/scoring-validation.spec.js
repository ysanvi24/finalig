const { test, expect } = require('@playwright/test');

const API = 'http://127.0.0.1:5000/api';

// Helper function to get admin token
async function getAdminToken(request) {
    const res = await request.post(`${API}/auth/login`, {
        data: { username: 'admin', password: 'admin123' }
    });
    const data = await res.json();
    return data.token;
}

// Focused tests for the scoring system overhaul
test.describe('🏆 Scoring System Validation', () => {

    test('GET /api/official-events returns 78 total events', async ({ request }) => {
        const res = await request.get(`${API}/official-events`);
        expect(res.status()).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.total).toBe(78);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data.length).toBe(78);
    });

    test('Official events: 19 BRACKET + 59 GROUP breakdown', async ({ request }) => {
        const res = await request.get(`${API}/official-events`);
        const events = (await res.json()).data || [];
        const brackets = events.filter(e => e.type === 'BRACKET');
        const groups = events.filter(e => e.type === 'GROUP');
        expect(brackets.length).toBe(19);
        expect(groups.length).toBe(59);
    });

    test('Event #1 (Badminton) has correct structure', async ({ request }) => {
        const res = await request.get(`${API}/official-events/1`);
        expect(res.status()).toBe(200);
        const event = (await res.json()).data;
        expect(event.eventNumber).toBe(1);
        expect(event.name).toBe('Badminton');
        expect(event.type).toBe('BRACKET');
        // P1 = 35 points for Badminton
        const p1 = event.positions?.['1'] ?? event.positions?.[1] ?? 0;
        expect(p1).toBe(35);
    });

    test('Cricket Boys (#4) has P1 = 60 points', async ({ request }) => {
        const res = await request.get(`${API}/official-events/4`);
        expect(res.status()).toBe(200);
        const event = (await res.json()).data;
        expect(event.name).toBe('Cricket (Boys)');
        const p1 = event.positions?.['1'] ?? event.positions?.[1] ?? 0;
        expect(p1).toBe(60);
    });

    test('Flash Mob - all 8 departments get 30 points', async ({ request }) => {
        const res = await request.get(`${API}/official-events`);
        const events = (await res.json()).data || [];
        const flashMob = events.find(e => e.name === 'Flash Mob');
        expect(flashMob).toBeTruthy();
        for (let pos = 1; pos <= 8; pos++) {
            const pts = flashMob.positions?.[String(pos)] ?? flashMob.positions?.[pos] ?? -1;
            expect(pts).toBe(30);
        }
    });

    test('All official events have valid position points (P1 > 0)', async ({ request }) => {
        const res = await request.get(`${API}/official-events`);
        const events = (await res.json()).data || [];
        for (const event of events) {
            const p1 = event.positions?.['1'] ?? event.positions?.[1] ?? 0;
            expect(p1).toBeGreaterThan(0);
            expect(event.eventNumber).toBeGreaterThanOrEqual(1);
            expect(event.eventNumber).toBeLessThanOrEqual(78);
        }
    });

    test('Bracket API requires authentication', async ({ request }) => {
        // Unauthenticated bracket start should fail
        const res = await request.post(`${API}/brackets/1/start`, {
            data: { pairings: [] }
        });
        expect(res.status()).toBe(401);
    });

    test('Event rank assignment requires auth', async ({ request }) => {
        const res = await request.post(`${API}/events/000000000000000000000001/assign-ranks`, {
            data: { ranks: [], officialEventNumber: 20 }
        });
        expect(res.status()).toBe(401);
    });

    test('8 departments in leaderboard (including ARCH)', async ({ request }) => {
        const res = await request.get(`${API}/leaderboard`);
        expect(res.status()).toBe(200);
        const standings = (await res.json()).data || [];
        expect(standings.length).toBe(8);
        
        // Check that we have all 8 departments by checking shortCodes
        const deptRes = await request.get(`${API}/departments`);
        const departments = (await deptRes.json()).data || [];
        expect(departments.length).toBe(8);
        
        const archDept = departments.find(d => d.shortCode === 'ARCH');
        expect(archDept).toBeTruthy();
        expect(archDept.name).toBe('Architecture');
    });

    test('Official events filter by type works', async ({ request }) => {
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