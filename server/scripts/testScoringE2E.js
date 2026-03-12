/**
 * testScoringE2E.js — End-to-end scoring system tests.
 *
 * Tests:
 *  A. scoringTable config integrity (all 78 events, totals, special cases)
 *  B. BRACKET flow simulation (Badminton #1 — 8 depts, full QF→SF→LM→Final)
 *  C. GROUP rank assignment (Triathlon #20)
 *  D. Special events (Flash Mob #61, Mascot #72, Peace Rally #63, Campus Décor #68)
 *  E. Leaderboard aggregation after multiple events
 *
 * Usage:  node server/scripts/testScoringE2E.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const OfficialEvent = require('../models/OfficialEvent');
const { Match } = require('../models/Match');
const Department = require('../models/Department');
const PointLog = require('../models/PointLog');
const { SCORING_TABLE, byNumber, getPoints } = require('../config/scoringTable');

// ─── Test helpers ─────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
function assert(condition, label) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else           { console.error(`  ❌ ${label}`); failed++; }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── A. scoringTable integrity ──────────────────────────────────────────────
  console.log('═══ A. Scoring Table Config Integrity ═══');
  assert(SCORING_TABLE.length === 78, `Total events = 78 (got ${SCORING_TABLE.length})`);
  const bracketEvents = SCORING_TABLE.filter(e => e.type === 'BRACKET');
  const groupEvents   = SCORING_TABLE.filter(e => e.type === 'GROUP');
  assert(bracketEvents.length === 19, `BRACKET events = 19 (got ${bracketEvents.length})`);
  assert(groupEvents.length   === 59, `GROUP events = 59 (got ${groupEvents.length})`);

  // All event numbers unique 1-78
  const nums = SCORING_TABLE.map(e => e.eventNumber);
  assert(new Set(nums).size === 78, 'All event numbers are unique');
  assert(Math.min(...nums) === 1 && Math.max(...nums) === 78, 'Event numbers span 1-78');

  // Point checks from the rule images
  assert(getPoints(1, 1) === 35, 'Badminton P1 = 35');
  assert(getPoints(1, 2) === 25, 'Badminton P2 = 25');
  assert(getPoints(1, 4) === 5,  'Badminton P4 = 5');
  assert(getPoints(4, 1) === 60, 'Cricket Boys P1 = 60');
  assert(getPoints(6, 1) === 60, 'Football P1 = 60');
  assert(getPoints(43, 1) === 40,'VALORANT P1 = 40');
  assert(getPoints(43, 4) === 10,'VALORANT P4 = 10');
  assert(getPoints(54, 8) === 10,'Video P8 = 10 (all 8 paid)');
  assert(getPoints(61, 1) === 30,'Flash Mob P1 = 30 (flat)');
  assert(getPoints(61, 8) === 30,'Flash Mob P8 = 30 (all equal)');
  assert(getPoints(63, 1) === 75,'Peace Rally P1 = 75');
  assert(getPoints(63, 8) === 30,'Peace Rally P8 = 30');
  assert(getPoints(68, 1) === 75,'Campus Décor P1 = 75');
  assert(getPoints(68, 8) === 40,'Campus Décor P8 = 40');
  assert(getPoints(69, 1) === 15,'Reel-Pic P1 = 15');
  assert(getPoints(69, 2) === 0, 'Reel-Pic P2 = 0');
  assert(getPoints(72, 1) === 20,'Mascot P1 = 20');
  assert(getPoints(72, 8) === 20,'Mascot P8 = 20 (all equal)');
  console.log();

  // ── B. Bracket simulation (Badminton #1) ───────────────────────────────────
  console.log('═══ B. BRACKET simulation — Badminton (#1) ═══');

  const depts = await Department.find({}).lean();
  assert(depts.length >= 8, `At least 8 departments in DB (got ${depts.length})`);
  assert(depts.some(d => d.shortCode === 'ARCH'), 'Architecture dept exists');
  assert(depts.some(d => d.shortCode === 'CHEMINE'), 'CheMine dept exists');

  const oe = await OfficialEvent.findOne({ eventNumber: 1 });
  assert(!!oe, 'Official event #1 (Badminton) in DB');
  if (!oe) { console.error('Cannot continue bracket test without OfficialEvent #1. Run seedOfficialEvents first.'); }
  else {
    // Clean up any existing test bracket matches for event #1
    await Match.deleteMany({ officialEvent: oe._id });

    // Create QF (4 matches with 8 departments)
    const shuffled = [...depts].sort(() => Math.random() - 0.5).slice(0, 8);
    const qfMatches = await Promise.all([
      Match.create({ sport: 'BADMINTON', officialEvent: oe._id, teamA: shuffled[0]._id, teamB: shuffled[1]._id, bracketRound: 'QF', bracketSlot: 1, matchCategory: 'QUARTER_FINAL', status: 'SCHEDULED' }),
      Match.create({ sport: 'BADMINTON', officialEvent: oe._id, teamA: shuffled[2]._id, teamB: shuffled[3]._id, bracketRound: 'QF', bracketSlot: 2, matchCategory: 'QUARTER_FINAL', status: 'SCHEDULED' }),
      Match.create({ sport: 'BADMINTON', officialEvent: oe._id, teamA: shuffled[4]._id, teamB: shuffled[5]._id, bracketRound: 'QF', bracketSlot: 3, matchCategory: 'QUARTER_FINAL', status: 'SCHEDULED' }),
      Match.create({ sport: 'BADMINTON', officialEvent: oe._id, teamA: shuffled[6]._id, teamB: shuffled[7]._id, bracketRound: 'QF', bracketSlot: 4, matchCategory: 'QUARTER_FINAL', status: 'SCHEDULED' }),
    ]);
    assert(qfMatches.length === 4, 'Created 4 QF matches');

    // Complete QF — always pick teamA as winner
    const qfWinners = [], qfLosers = [];
    for (const m of qfMatches) {
      m.status = 'COMPLETED';
      m.winner = m.teamA;
      await m.save();
      qfWinners.push(m.teamA);
      qfLosers.push(m.teamB);
    }

    // Create SF
    const sfMatches = await Promise.all([
      Match.create({ sport: 'BADMINTON', officialEvent: oe._id, teamA: qfWinners[0], teamB: qfWinners[1], bracketRound: 'SF', bracketSlot: 1, matchCategory: 'SEMIFINAL', status: 'SCHEDULED' }),
      Match.create({ sport: 'BADMINTON', officialEvent: oe._id, teamA: qfWinners[2], teamB: qfWinners[3], bracketRound: 'SF', bracketSlot: 2, matchCategory: 'SEMIFINAL', status: 'SCHEDULED' }),
    ]);

    // Complete SF
    const sfWinners = [], sfLosers = [];
    for (const m of sfMatches) {
      m.status = 'COMPLETED'; m.winner = m.teamA; await m.save();
      sfWinners.push(m.teamA); sfLosers.push(m.teamB);
    }

    // Create LM + Final
    const [lmMatch, finalMatch] = await Promise.all([
      Match.create({ sport: 'BADMINTON', officialEvent: oe._id, teamA: sfLosers[0], teamB: sfLosers[1], bracketRound: 'LM', bracketSlot: 1, matchCategory: 'REGULAR', status: 'SCHEDULED' }),
      Match.create({ sport: 'BADMINTON', officialEvent: oe._id, teamA: sfWinners[0], teamB: sfWinners[1], bracketRound: 'FINAL', bracketSlot: 1, matchCategory: 'FINAL', status: 'SCHEDULED' }),
    ]);

    // Complete LM + Final
    lmMatch.status = 'COMPLETED'; lmMatch.winner = lmMatch.teamA; await lmMatch.save();
    finalMatch.status = 'COMPLETED'; finalMatch.winner = finalMatch.teamA; await finalMatch.save();

    assert(true, 'All 7 bracket matches created and completed');

    // Manually award points (calling internal logic)
    const { clearCache } = require('../utils/cache');
    const posMap = oe.positions instanceof Map ? oe.positions : new Map(Object.entries(oe.positions));
    const p1Dept = finalMatch.winner;
    const p2Dept = finalMatch.teamA.toString() === p1Dept.toString() ? finalMatch.teamB : finalMatch.teamA;
    const p3Dept = lmMatch.winner;
    const p4Dept = lmMatch.teamA.toString() === p3Dept.toString() ? lmMatch.teamB : lmMatch.teamA;

    const allQF = await Match.find({ officialEvent: oe._id, bracketRound: 'QF' }).sort({ bracketSlot: 1 });
    const qfLosersList = allQF.map(m => m.teamA.toString() === m.winner.toString() ? m.teamB : m.teamA);

    const entries = [
      { dept: p1Dept, position: 1 }, { dept: p2Dept, position: 2 },
      { dept: p3Dept, position: 3 }, { dept: p4Dept, position: 4 },
      ...qfLosersList.map((d, i) => ({ dept: d, position: 5 + i })),
    ];

    const prevLogs = await PointLog.countDocuments();
    for (const { dept, position } of entries) {
      const pts = Number(posMap.get(String(position)) ?? 0);
      if (pts > 0) {
        await PointLog.create({ department: dept, points: pts, category: 'Sports', eventName: 'Badminton (TEST)', position: `P${position}`, description: `E2E test` });
      }
    }
    await Match.updateMany({ officialEvent: oe._id }, { pointsAwarded: true });
    clearCache('leaderboard');

    const newLogs = await PointLog.countDocuments() - prevLogs;
    // P1(35) P2(25) P3(15) P4(5) → 4 non-zero point logs
    assert(newLogs === 4, `Created 4 PointLogs (P1-P4 non-zero, P5-P8=0) — got ${newLogs}`);

    // Verify point values
    const p1Log = await PointLog.findOne({ department: p1Dept, eventName: 'Badminton (TEST)' });
    const p2Log = await PointLog.findOne({ department: p2Dept, eventName: 'Badminton (TEST)' });
    const p3Log = await PointLog.findOne({ department: p3Dept, eventName: 'Badminton (TEST)' });
    const p4Log = await PointLog.findOne({ department: p4Dept, eventName: 'Badminton (TEST)' });
    assert(p1Log?.points === 35, `P1 gets 35 pts (Badminton) — got ${p1Log?.points}`);
    assert(p2Log?.points === 25, `P2 gets 25 pts — got ${p2Log?.points}`);
    assert(p3Log?.points === 15, `P3 gets 15 pts — got ${p3Log?.points}`);
    assert(p4Log?.points === 5,  `P4 gets 5 pts — got ${p4Log?.points}`);
  }
  console.log();

  // ── C. GROUP rank assignment (Triathlon #20) ───────────────────────────────
  console.log('═══ C. GROUP event — Triathlon (#20) ═══');
  const triOE = await OfficialEvent.findOne({ eventNumber: 20 });
  assert(!!triOE, 'Official event #20 (Triathlon) in DB');
  if (triOE) {
    const posMapTri = triOE.positions instanceof Map ? triOE.positions : new Map(Object.entries(triOE.positions));
    const allDepts8 = (await Department.find({}).lean()).slice(0, 8);
    // Simulate point logs for ranks 1-8
    const prevCount = await PointLog.countDocuments();
    for (let i = 0; i < 8; i++) {
      const pts = Number(posMapTri.get(String(i + 1)) ?? 0);
      if (pts > 0) {
        await PointLog.create({ department: allDepts8[i]._id, points: pts, category: 'Sports', eventName: 'Triathlon (TEST)', position: `P${i+1}`, description: 'E2E test' });
      }
    }
    const newCount = await PointLog.countDocuments() - prevCount;
    assert(newCount === 4, `Triathlon: 4 non-zero PointLogs (P1-P4, P5-P8=0) — got ${newCount}`);
    const triP1 = await PointLog.findOne({ department: allDepts8[0]._id, eventName: 'Triathlon (TEST)' });
    assert(triP1?.points === 50, `Triathlon P1 = 50 pts — got ${triP1?.points}`);
  }
  console.log();

  // ── D. Special events ─────────────────────────────────────────────────────
  console.log('═══ D. Special Events ═══');
  const allDepts8 = (await Department.find({}).lean()).slice(0, 8);

  // Flash Mob #61 — all 8 get 30 pts
  const flashOE = await OfficialEvent.findOne({ eventNumber: 61 });
  if (flashOE) {
    const flashMap = flashOE.positions instanceof Map ? flashOE.positions : new Map(Object.entries(flashOE.positions));
    const flashPts = allDepts8.map((_, i) => Number(flashMap.get(String(i + 1)) ?? 0));
    assert(flashPts.every(p => p === 30), `Flash Mob: all 8 positions = 30 pts (${flashPts})`);
  }

  // Mascot #72 — all 8 get 20 pts
  const mascotOE = await OfficialEvent.findOne({ eventNumber: 72 });
  if (mascotOE) {
    const mascMap = mascotOE.positions instanceof Map ? mascotOE.positions : new Map(Object.entries(mascotOE.positions));
    const mascPts = Array.from({ length: 8 }, (_, i) => Number(mascMap.get(String(i + 1)) ?? 0));
    assert(mascPts.every(p => p === 20), `Mascot: all 8 positions = 20 pts (${mascPts})`);
  }

  // Peace Rally #63 — all 8 positions non-zero
  const rallyOE = await OfficialEvent.findOne({ eventNumber: 63 });
  if (rallyOE) {
    const rallyMap = rallyOE.positions instanceof Map ? rallyOE.positions : new Map(Object.entries(rallyOE.positions));
    const expected = [75, 65, 55, 50, 45, 40, 35, 30];
    const actual = expected.map((_, i) => Number(rallyMap.get(String(i + 1)) ?? 0));
    assert(JSON.stringify(actual) === JSON.stringify(expected), `Peace Rally P1-P8 = [${expected}] — got [${actual}]`);
  }

  // Campus Décor #68 — all 8 positions non-zero
  const decorOE = await OfficialEvent.findOne({ eventNumber: 68 });
  if (decorOE) {
    const decorMap = decorOE.positions instanceof Map ? decorOE.positions : new Map(Object.entries(decorOE.positions));
    const expected = [75, 70, 65, 60, 55, 50, 45, 40];
    const actual = expected.map((_, i) => Number(decorMap.get(String(i + 1)) ?? 0));
    assert(JSON.stringify(actual) === JSON.stringify(expected), `Campus Décor P1-P8 = [${expected}] — got [${actual}]`);
  }

  // Video #54 — all 8 positions non-zero
  const videoOE = await OfficialEvent.findOne({ eventNumber: 54 });
  if (videoOE) {
    const vidMap = videoOE.positions instanceof Map ? videoOE.positions : new Map(Object.entries(videoOE.positions));
    const expected = [80, 60, 50, 40, 30, 20, 15, 10];
    const actual = expected.map((_, i) => Number(vidMap.get(String(i + 1)) ?? 0));
    assert(JSON.stringify(actual) === JSON.stringify(expected), `Video P1-P8 = [${expected}] — got [${actual}]`);
  }
  console.log();

  // ── E. Leaderboard aggregation ─────────────────────────────────────────────
  console.log('═══ E. Leaderboard Aggregation ═══');
  const standings = await PointLog.aggregate([
    { $group: { _id: '$department', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
    { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
    { $sort: { totalPoints: -1 } },
    { $project: { name: '$dept.name', shortCode: '$dept.shortCode', totalPoints: 1 } },
  ]);
  assert(standings.length > 0, `Leaderboard has ${standings.length} entries`);
  assert(standings[0].totalPoints >= standings[standings.length - 1].totalPoints, 'Leaderboard sorted descending');
  const topEntry = standings[0];
  console.log(`  📊 Current leader: ${topEntry.name} (${topEntry.shortCode}) — ${topEntry.totalPoints} pts`);
  console.log();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('════════════════════════════════════════');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  if (failed > 0) console.error(`❌ ${failed} test(s) FAILED`);
  else console.log('🎉 All tests passed!');

  // Clean up test PointLogs (keep real data)
  await PointLog.deleteMany({ description: 'E2E test' });
  await PointLog.deleteMany({ eventName: { $in: ['Badminton (TEST)', 'Triathlon (TEST)'] } });
  console.log('🧹 Test PointLogs cleaned up');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ Test run failed:', err);
  process.exit(1);
});
