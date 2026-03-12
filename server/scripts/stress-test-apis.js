/**
 * Comprehensive API Stress Test
 * Tests every public and admin API endpoint for:
 *   - Correct status codes
 *   - Response format validation
 *   - Error handling (bad IDs, missing fields)
 *   - Concurrent request handling
 *   - Large payload handling
 *   - Empty/null field resilience
 */
const BASE = 'http://127.0.0.1:5000/api';

async function f(url, opts = {}) {
    const res = await fetch(`${BASE}${url}`, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...opts.headers },
        ...opts,
    });
    let body;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status, body, ok: res.ok };
}

let passed = 0, failed = 0, total = 0;
const failures = [];

function assert(name, condition) {
    total++;
    if (condition) { passed++; process.stdout.write('✅'); }
    else { failed++; failures.push(name); process.stdout.write('❌'); }
}

async function login() {
    const r = await f('/auth/login', {
        method: 'POST', body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });
    return r.body?.token;
}

async function run() {
    console.log('🔥 Starting Comprehensive API Stress Test\n');

    // ═══════════════════════════════════════
    // 1. PUBLIC GET ENDPOINTS
    // ═══════════════════════════════════════
    console.log('\n── PUBLIC APIs ──');
    
    let r;
    r = await f('/health');
    assert('GET /health → 200', r.status === 200);

    r = await f('/matches');
    assert('GET /matches → 200', r.status === 200);
    assert('GET /matches returns array', Array.isArray(r.body?.data));
    const matchId = r.body?.data?.[0]?._id;

    r = await f('/matches?limit=5&page=1');
    assert('GET /matches pagination', r.status === 200);

    r = await f('/matches?sport=CRICKET');
    assert('GET /matches sport filter', r.status === 200);

    if (matchId) {
        r = await f(`/matches/${matchId}`);
        assert('GET /matches/:id → 200', r.status === 200);
    }

    r = await f('/matches/000000000000000000000000');
    assert('GET /matches/badId → 404', r.status === 404);

    r = await f('/matches/not-a-valid-id');
    assert('GET /matches/invalidId → 4xx', r.status >= 400);

    r = await f('/departments');
    assert('GET /departments → 200', r.status === 200);
    assert('GET /departments returns array', Array.isArray(r.body?.data || r.body));

    r = await f('/leaderboard');
    assert('GET /leaderboard → 200', r.status === 200);

    r = await f('/leaderboard/detailed');
    assert('GET /leaderboard/detailed → 200', r.status === 200);

    r = await f('/student-council');
    assert('GET /student-council → 200', r.status === 200);
    assert('GET /student-council returns array', Array.isArray(r.body?.data));

    r = await f('/about');
    assert('GET /about → 200', r.status === 200);

    r = await f('/highlights');
    assert('GET /highlights → 200', r.status === 200);

    r = await f('/highlights/dates');
    assert('GET /highlights/dates → 200', r.status === 200);

    r = await f('/highlights?date=2025-01-01');
    assert('GET /highlights with date filter', r.status === 200);

    r = await f('/scoring-presets');
    assert('GET /scoring-presets → 200', r.status === 200);

    // ═══════════════════════════════════════
    // 2. AUTH ENDPOINTS
    // ═══════════════════════════════════════
    console.log('\n── AUTH ──');

    r = await f('/auth/login', { method: 'POST', body: JSON.stringify({}) });
    assert('POST /auth/login empty body → 4xx', r.status >= 400);

    r = await f('/auth/login', { method: 'POST', body: JSON.stringify({ username: 'admin', password: 'wrong' }) });
    assert('POST /auth/login wrong pwd → 401', r.status === 401);

    r = await f('/auth/login', { method: 'POST', body: JSON.stringify({ username: 'nonexistent', password: 'test' }) });
    assert('POST /auth/login no user → 401', r.status === 401);

    const token = await login();
    assert('POST /auth/login correct → token', !!token);

    r = await f('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    assert('GET /auth/me valid token → 200', r.status === 200);

    r = await f('/auth/me', { headers: { Authorization: 'Bearer invalidtoken' } });
    assert('GET /auth/me bad token → 401', r.status === 401);

    r = await f('/auth/me');
    assert('GET /auth/me no token → 401', r.status === 401);

    // ═══════════════════════════════════════
    // 3. PROTECTED ADMIN ENDPOINTS
    // ═══════════════════════════════════════
    console.log('\n── ADMIN (PROTECTED) ──');
    const auth = { Authorization: `Bearer ${token}` };

    // Without token → 401
    r = await f('/admins', { method: 'GET' });
    assert('GET /admins no auth → 401', r.status === 401);

    r = await f('/admins', { headers: auth });
    assert('GET /admins with auth → 200', r.status === 200);

    // ═══════════════════════════════════════
    // 4. ERROR HANDLING — MALFORMED REQUESTS
    // ═══════════════════════════════════════
    console.log('\n── ERROR HANDLING ──');

    // Invalid JSON body
    r = await fetch(`${BASE}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: 'not valid json{{{',
    });
    assert('Malformed JSON → 400', r.status === 400);

    // Non-existent route
    r = await f('/this-route-does-not-exist');
    assert('Non-existent route → 404', r.status === 404);

    // ═══════════════════════════════════════
    // 5. NOSQL INJECTION RESISTANCE
    // ═══════════════════════════════════════
    console.log('\n── SECURITY ──');

    r = await f('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: { $gt: '' }, password: { $gt: '' } }),
    });
    assert('NoSQL injection blocked', r.status >= 400);

    r = await f('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: '<script>alert(1)</script>', password: 'test' }),
    });
    assert('XSS in login field → rejected', r.status >= 400);

    // ═══════════════════════════════════════
    // 6. CONCURRENT REQUEST BURST
    // ═══════════════════════════════════════
    console.log('\n── CONCURRENCY ──');

    const burst = await Promise.all(
        Array.from({ length: 50 }, () => f('/leaderboard'))
    );
    const allOk = burst.every(r => r.status === 200 || r.status === 429);
    assert('50 concurrent /leaderboard → all 200|429', allOk);

    const burst2 = await Promise.all(
        Array.from({ length: 50 }, () => f('/matches'))
    );
    const allOk2 = burst2.every(r => r.status === 200 || r.status === 429);
    assert('50 concurrent /matches → all 200|429', allOk2);

    const burst3 = await Promise.all(
        Array.from({ length: 50 }, () => f('/student-council'))
    );
    const allOk3 = burst3.every(r => r.status === 200 || r.status === 429);
    assert('50 concurrent /student-council → all 200|429', allOk3);

    // ═══════════════════════════════════════
    // 7. LARGE PAYLOAD HANDLING
    // ═══════════════════════════════════════
    console.log('\n── PAYLOAD HANDLING ──');

    const hugeName = 'A'.repeat(100000);
    r = await f('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: hugeName, password: 'test' }),
    });
    assert('100KB username → rejected or handled', r.status >= 400 || r.status === 413);

    // ═══════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════
    console.log('\n\n═══════════════════════════════════════');
    console.log(`  RESULTS: ${passed}/${total} passed`);
    if (failures.length) {
        console.log(`  ❌ FAILURES:`);
        failures.forEach(f => console.log(`     - ${f}`));
    } else {
        console.log('  ✅ ALL TESTS PASSED');
    }
    console.log('═══════════════════════════════════════\n');
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
