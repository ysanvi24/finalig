#!/usr/bin/env node
/**
 * Production-Load Test Data Seeder
 * Creates 100 matches across all sports, awards points, creates 15 days of highlights.
 * Usage: node server/scripts/seed-production-test-data.js
 */

const API = 'http://127.0.0.1:5000/api';

async function main() {
    console.log('🏗️  VNIT Shashwatam — Production Load Test Data Seeder');
    console.log('═══════════════════════════════════════════════════════\n');

    // ── 1. Login ──
    console.log('🔐 Logging in...');
    const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const { token } = await loginRes.json();
    const auth = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    console.log('✅ Logged in\n');

    // ── 2. Fetch departments ──
    console.log('🏢 Fetching departments...');
    const deptRes = await fetch(`${API}/departments`, { headers: auth });
    const deptData = await deptRes.json();
    const depts = deptData.data || deptData;
    console.log(`✅ ${depts.length} departments: ${depts.map(d => d.shortCode).join(', ')}\n`);

    // ── 3. Seed scoring presets ──
    console.log('⚙️  Seeding scoring presets...');
    await fetch(`${API}/scoring-presets/seed-defaults`, { method: 'POST', headers: auth });
    console.log('✅ Scoring presets seeded\n');

    // ── 4. Create 100 matches across 10 sports ──
    const SPORTS = ['CRICKET','BADMINTON','TABLE_TENNIS','VOLLEYBALL','FOOTBALL','HOCKEY','BASKETBALL','KHOKHO','KABADDI','CHESS'];
    const CATEGORIES = ['GROUP_STAGE', 'QUARTER_FINAL', 'SEMIFINAL', 'FINAL', 'REGULAR'];
    const VENUES = ['LHC Ground', 'SAC Court', 'Visvesvaraya Hall', 'Main Ground', 'Indoor Stadium', 'Basketball Court', 'Volleyball Court', 'Hockey Turf', 'Chess Room', 'TT Hall'];

    // Generate all possible dept pairs
    const pairs = [];
    for (let i = 0; i < depts.length; i++) {
        for (let j = i + 1; j < depts.length; j++) {
            pairs.push([depts[i], depts[j]]);
        }
    }
    // 7C2 = 21 pairs. We need 100 matches → repeat pairs across sports

    console.log('🏟️  Creating 100 matches...');
    const createdMatches = [];
    let matchIdx = 0;

    for (let m = 0; m < 100; m++) {
        const sport = SPORTS[m % SPORTS.length];
        const pair = pairs[m % pairs.length];
        const category = CATEGORIES[m % CATEGORIES.length];
        const venue = VENUES[m % VENUES.length];
        // Spread matches across 15 days: March 1–15, 2026
        const day = (m % 15) + 1;
        const dateStr = `2026-03-${String(day).padStart(2, '0')}`;
        const hour = 8 + (m % 12); // 8AM to 7PM

        const matchData = {
            sport,
            teamA: pair[0]._id,
            teamB: pair[1]._id,
            date: `${dateStr}T${String(hour).padStart(2, '0')}:00:00.000Z`,
            venue,
            matchCategory: category,
            tags: [sport.toLowerCase(), pair[0].shortCode.toLowerCase(), pair[1].shortCode.toLowerCase()]
        };

        try {
            const res = await fetch(`${API}/matches`, {
                method: 'POST',
                headers: auth,
                body: JSON.stringify(matchData)
            });
            if (res.ok) {
                const data = await res.json();
                const match = data.data || data.match || data;
                createdMatches.push(match);
                matchIdx++;
                if (matchIdx % 20 === 0) process.stdout.write(`  ✓ ${matchIdx}/100 created\n`);
            } else {
                const err = await res.json().catch(() => ({}));
                console.log(`  ⚠️  Match ${m + 1} skip: ${err.message || res.status}`);
            }
        } catch (e) {
            console.log(`  ❌ Match ${m + 1} error: ${e.message}`);
        }
    }
    console.log(`✅ ${createdMatches.length} matches created\n`);

    // ── 5. Complete 80 matches with scores and winners, 10 draws, 10 remain scheduled ──
    console.log('📊 Updating match scores and statuses...');
    let completed = 0, drawn = 0, scheduled = 0;

    // Score generators per sport
    const scoreGen = {
        CRICKET:      () => { const a = 100 + Math.floor(Math.random() * 180); const b = 80 + Math.floor(Math.random() * 200); return [`${a}/${2 + Math.floor(Math.random() * 8)}`, `${b}/${Math.floor(Math.random() * 10)}`]; },
        FOOTBALL:     () => { const a = Math.floor(Math.random() * 5); const b = Math.floor(Math.random() * 5); return [`${a}`, `${b}`]; },
        BASKETBALL:   () => { const a = 50 + Math.floor(Math.random() * 50); const b = 50 + Math.floor(Math.random() * 50); return [`${a}`, `${b}`]; },
        VOLLEYBALL:   () => { const a = 2 + Math.floor(Math.random() * 2); const b = Math.floor(Math.random() * 3); return [`${a}`, `${b}`]; },
        BADMINTON:    () => { const a = 2 + Math.floor(Math.random() * 2); const b = Math.floor(Math.random() * 3); return [`${a}`, `${b}`]; },
        TABLE_TENNIS: () => { const a = 3 + Math.floor(Math.random() * 2); const b = Math.floor(Math.random() * 4); return [`${a}`, `${b}`]; },
        HOCKEY:       () => { const a = Math.floor(Math.random() * 6); const b = Math.floor(Math.random() * 6); return [`${a}`, `${b}`]; },
        KHOKHO:       () => { const a = 5 + Math.floor(Math.random() * 15); const b = 3 + Math.floor(Math.random() * 15); return [`${a}`, `${b}`]; },
        KABADDI:      () => { const a = 20 + Math.floor(Math.random() * 25); const b = 18 + Math.floor(Math.random() * 25); return [`${a}`, `${b}`]; },
        CHESS:        () => { const a = 2 + Math.floor(Math.random() * 3); const b = Math.floor(Math.random() * 4); return [`${a}`, `${b}`]; },
    };

    for (let i = 0; i < createdMatches.length; i++) {
        const match = createdMatches[i];
        const matchId = match._id;
        const sport = match.sport;

        if (i >= 90) {
            // Last 10 matches remain SCHEDULED
            scheduled++;
            continue;
        }

        const [scoreA, scoreB] = (scoreGen[sport] || scoreGen.FOOTBALL)();
        const numA = parseInt(scoreA);
        const numB = parseInt(scoreB);

        let winner = null;
        let status = 'COMPLETED';
        let summary = '';

        if (i >= 80 && i < 90) {
            // 10 draws
            const drawScore = `${Math.floor(Math.random() * 3)}`;
            const updateData = {
                scoreA: drawScore,
                scoreB: drawScore,
                status: 'COMPLETED',
                summary: 'Match ended in a draw',
                _version: match.updatedAt
            };
            try {
                await fetch(`${API}/matches/${matchId}`, { method: 'PUT', headers: auth, body: JSON.stringify(updateData) });
                drawn++;
            } catch (e) { /* skip */ }
            continue;
        }

        // Determine winner for 80 matches
        if (numA > numB) {
            winner = match.teamA?._id || match.teamA;
            const teamACode = depts.find(d => d._id === (match.teamA?._id || match.teamA))?.shortCode || 'Team A';
            summary = `${teamACode} won`;
        } else if (numB > numA) {
            winner = match.teamB?._id || match.teamB;
            const teamBCode = depts.find(d => d._id === (match.teamB?._id || match.teamB))?.shortCode || 'Team B';
            summary = `${teamBCode} won`;
        } else {
            // Tie — make A win by 1
            const newScoreA = `${numA + 1}`;
            winner = match.teamA?._id || match.teamA;
            const teamACode = depts.find(d => d._id === (match.teamA?._id || match.teamA))?.shortCode || 'Team A';
            summary = `${teamACode} won in a close match`;
            const updateData = {
                scoreA: newScoreA,
                scoreB,
                status: 'COMPLETED',
                winner,
                summary,
                _version: match.updatedAt
            };
            try {
                await fetch(`${API}/matches/${matchId}`, { method: 'PUT', headers: auth, body: JSON.stringify(updateData) });
                completed++;
            } catch (e) { /* skip */ }
            continue;
        }

        const updateData = {
            scoreA,
            scoreB,
            status: 'COMPLETED',
            winner,
            summary,
            _version: match.updatedAt
        };
        try {
            const res = await fetch(`${API}/matches/${matchId}`, { method: 'PUT', headers: auth, body: JSON.stringify(updateData) });
            if (res.ok) completed++;
            else {
                const err = await res.json().catch(() => ({}));
                // console.log(`  ⚠️  Update match ${i + 1} skip: ${err.message || res.status}`);
            }
        } catch (e) { /* skip */ }

        if ((i + 1) % 20 === 0) process.stdout.write(`  ✓ ${i + 1}/100 updated\n`);
    }
    console.log(`✅ ${completed} completed, ${drawn} draws, ${scheduled} scheduled\n`);

    // ── 6. Award points from completed matches ──
    console.log('🏆 Awarding points from completed matches...');
    let awarded = 0, skipped = 0;

    // Re-fetch all matches to get the updated ones
    const allMatchesRes = await fetch(`${API}/matches?limit=200`, { headers: auth });
    const allMatchesData = await allMatchesRes.json();
    const allMatches = allMatchesData.data || allMatchesData.matches || [];

    for (const match of allMatches) {
        if (match.status !== 'COMPLETED') continue;
        if (match.pointsAwarded) { skipped++; continue; }

        try {
            const res = await fetch(`${API}/leaderboard/award-from-match`, {
                method: 'POST',
                headers: auth,
                body: JSON.stringify({ matchId: match._id })
            });
            if (res.ok) awarded++;
            else {
                const err = await res.json().catch(() => ({}));
                if (err.message?.includes('already')) skipped++;
            }
        } catch (e) { /* skip */ }
    }
    console.log(`✅ ${awarded} point awards applied, ${skipped} already awarded\n`);

    // ── 7. Create 15 days of highlights (reel + pic + article each day) ──
    console.log('✨ Creating 15 days of highlights...');
    let hlCreated = 0;

    const reelCaptions = [
        'Epic match winning moment 🏏', 'Best goal of the day ⚽', 'Incredible volleyball spike 🏐',
        'Chess grandmaster move ♟️', 'Kabaddi tackle of the day 🤼', 'Basketball dunk compilation 🏀',
        'Hockey penalty corner 🏑', 'Badminton rally of the year 🏸', 'Table tennis smash 🏓',
        'Kho-Kho chase sequence 🏃', 'Opening ceremony highlights 🎭', 'Award ceremony moments 🏆',
        'Behind the scenes with athletes 🎬', 'Fan reactions compilation 🎉', 'Day wrap-up reel 🌅'
    ];

    const articleTitles = [
        'Day 1: Shashwatam 2026 kicks off with a bang!',
        'Day 2: Cricket dominates as CSE takes early lead',
        'Day 3: Volleyball upsets shake the leaderboard',
        'Day 4: MECH makes a stunning comeback in basketball',
        'Day 5: Chess tournament enters decisive phase',
        'Day 6: Football semifinalists decided',
        'Day 7: Mid-event review — who leads the pack?',
        'Day 8: Kabaddi finals produce record-breaking scores',
        'Day 9: CIVIL surges with hockey and kho-kho wins',
        'Day 10: Table tennis crowns its champion',
        'Day 11: ECE pulls off the upset of the tournament',
        'Day 12: Badminton finals showcase incredible rallies',
        'Day 13: Leaderboard tightens — 3 departments within 10 points',
        'Day 14: Penultimate day brings dramatic finishes',
        'Day 15: Grand finale — Shashwatam 2026 crowns its champion'
    ];

    const articleBodies = articleTitles.map((title, i) => {
        return `${title}\n\nThe ${i + 1}${['st', 'nd', 'rd'][i] || 'th'} day of Institute Gathering 2026 — शाश्वतम् saw fierce competition across multiple sports. ` +
            `With ${7} departments battling for supremacy, every match carried enormous weight in the overall standings.\n\n` +
            `Key highlights from the day included outstanding performances in ${SPORTS[i % SPORTS.length].replace('_', ' ').toLowerCase()}, ` +
            `where teams displayed exceptional skill and sportsmanship.\n\n` +
            `The leaderboard continues to see dramatic shifts as departments trade positions with each passing match. ` +
            `Stay tuned for more updates from the ground!`;
    });

    for (let day = 1; day <= 15; day++) {
        const dateStr = `2026-03-${String(day).padStart(2, '0')}`;
        const deptIdx = (day - 1) % depts.length;

        // Reel of the day
        try {
            const res = await fetch(`${API}/highlights`, {
                method: 'POST', headers: auth,
                body: JSON.stringify({
                    type: 'reel',
                    instagramUrl: `https://www.instagram.com/reel/VNIT_IG_Day${day}_${Date.now()}/`,
                    caption: reelCaptions[day - 1],
                    date: dateStr,
                    department: depts[deptIdx]._id
                })
            });
            if (res.ok) hlCreated++;
        } catch (e) { /* skip */ }

        // Pic of the day
        try {
            const res = await fetch(`${API}/highlights`, {
                method: 'POST', headers: auth,
                body: JSON.stringify({
                    type: 'pic',
                    instagramUrl: `https://www.instagram.com/p/VNIT_IG_Pic_Day${day}_${Date.now()}/`,
                    caption: `Day ${day} — Best moment captured 📸`,
                    date: dateStr,
                    department: depts[(deptIdx + 1) % depts.length]._id
                })
            });
            if (res.ok) hlCreated++;
        } catch (e) { /* skip */ }

        // Article of the day
        try {
            const res = await fetch(`${API}/highlights`, {
                method: 'POST', headers: auth,
                body: JSON.stringify({
                    type: 'article',
                    content: articleBodies[day - 1],
                    caption: articleTitles[day - 1],
                    date: dateStr,
                    department: depts[(deptIdx + 2) % depts.length]._id
                })
            });
            if (res.ok) hlCreated++;
        } catch (e) { /* skip */ }
    }
    console.log(`✅ ${hlCreated} highlights created (target: 45 = 15 days × 3 types)\n`);

    // ── 8. Verify leaderboard ──
    console.log('📊 Verifying leaderboard...');
    const lbRes = await fetch(`${API}/leaderboard`);
    const lbData = await lbRes.json();
    const standings = lbData.data || lbData.standings || [];
    console.log('  Rank  | Department       | Points');
    console.log('  ------+------------------+-------');
    for (const s of standings) {
        const name = (s.department?.shortCode || s.department?.name || 'Unknown').padEnd(16);
        console.log(`  #${String(s.rank).padEnd(4)} | ${name} | ${s.totalPoints}`);
    }

    // ── 9. Verify highlight dates ──
    console.log('\n📅 Highlight dates available:');
    const datesRes = await fetch(`${API}/highlights/dates`);
    const dates = await datesRes.json();
    console.log(`  ${dates.length} dates: ${dates.slice(0, 5).join(', ')}${dates.length > 5 ? '...' : ''}`);

    // ── Summary ──
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ SEEDING COMPLETE');
    console.log(`  Matches:    ${createdMatches.length} created (${completed} completed, ${drawn} draws, ${scheduled} scheduled)`);
    console.log(`  Points:     ${awarded} awards applied`);
    console.log(`  Highlights: ${hlCreated} created across 15 days`);
    console.log(`  Leaderboard: ${standings.length} departments ranked`);
    console.log('═══════════════════════════════════════════════════════');
}

main().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});
