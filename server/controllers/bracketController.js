/**
 * BracketController — QF→SF→LM→Final tournament engine for IG events 1-19.
 *
 * Bracket structure for 8 departments (single elimination + 3rd-place match):
 *   Round 1 (QF)  : 4 matches  — slots 1-4
 *   Round 2 (SF)  : 2 matches  — slots 1-2  (QF winners)
 *   Round 3 (LM)  : 1 match    — 3rd-place match (SF losers)
 *   Round 4 (FINAL): 1 match   — (SF winners)
 *   Total         : 7 matches
 *
 * Position mapping after all 7 matches complete:
 *   FINAL winner  → P1   FINAL loser  → P2
 *   LM winner     → P3   LM loser     → P4
 *   QF losers (4) → P5, P6, P7, P8 (in slot order 1→4)
 */

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { Match } = require('../models/Match');
const Department = require('../models/Department');
const OfficialEvent = require('../models/OfficialEvent');
const PointLog = require('../models/PointLog');
const { clearCache } = require('../utils/cache');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Shuffle array in-place (Fisher-Yates) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Map category label → PointLog category enum
 */
const CATEGORY_MAP = {
  TEAM_SPORT: 'Sports',
  ESPORTS: 'Sports',
  ATHLETICS_TRACK: 'Sports',
  ATHLETICS_FIELD: 'Sports',
  AQUATICS: 'Sports',
  ENDURANCE: 'Sports',
  INDOOR: 'Sports',
  CULTURAL: 'Cultural',
  ART: 'Arts',
  LITERARY: 'Literary',
  OTHER: 'Other',
};

/**
 * Build a lean bracket snapshot for API responses.
 * Returns { officialEvent, qf, sf, lm, final, status, pointsAwarded }
 */
async function buildBracketSnapshot(officialEvent) {
  const oe = officialEvent._id || officialEvent;
  const matches = await Match.find({ officialEvent: oe })
    .populate('teamA', 'name shortCode logo')
    .populate('teamB', 'name shortCode logo')
    .populate('winner', 'name shortCode logo')
    .sort({ bracketRound: 1, bracketSlot: 1 })
    .lean();

  const roundOrder = { QF: 0, SF: 1, LM: 2, FINAL: 3 };
  matches.sort((a, b) =>
    (roundOrder[a.bracketRound] ?? 99) - (roundOrder[b.bracketRound] ?? 99) ||
    (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0)
  );

  const byRound = { QF: [], SF: [], LM: [], FINAL: [] };
  for (const m of matches) byRound[m.bracketRound]?.push(m);

  const allComplete = (arr) => arr.length > 0 && arr.every(m => m.status === 'COMPLETED');
  const pointsAwarded = matches.every(m => m.pointsAwarded);

  return {
    officialEvent: oe,
    rounds: byRound,
    totalMatches: matches.length,
    status: pointsAwarded
      ? 'AWARDED'
      : allComplete(byRound.FINAL) && allComplete(byRound.LM)
        ? 'COMPLETE'
        : allComplete(byRound.QF)
          ? 'SF_PENDING'
          : 'QF_PENDING',
    pointsAwarded,
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Start a bracket for a given official event number.
 *          Creates 4 QF matches. Pairings: random unless provided.
 * @route   POST /api/brackets/:eventNumber/start
 * @body    { pairings?: [[deptIdA, deptIdB], ...] }   // optional manual pairings (4 pairs)
 */
const startBracket = asyncHandler(async (req, res) => {
  const eventNumber = Number(req.params.eventNumber);
  const officialEvent = await OfficialEvent.findOne({ eventNumber });
  if (!officialEvent) {
    res.status(404); throw new Error(`Official event #${eventNumber} not found`);
  }
  if (officialEvent.type !== 'BRACKET') {
    res.status(400); throw new Error(`Event #${eventNumber} is a GROUP event, not a BRACKET event`);
  }

  // Check if bracket already exists
  const existing = await Match.findOne({ officialEvent: officialEvent._id, bracketRound: 'QF' });
  if (existing) {
    res.status(400); throw new Error(`Bracket for event #${eventNumber} already started. Use /reset to restart.`);
  }

  // Get all 8 departments
  const departments = await Department.find({}).lean();
  if (departments.length < 8) {
    res.status(400); throw new Error(`Need 8 departments, found ${departments.length}`);
  }

  // Determine pairings
  let pairings;
  if (req.body.pairings && Array.isArray(req.body.pairings) && req.body.pairings.length === 4) {
    pairings = req.body.pairings.map(pair =>
      pair.map(id => departments.find(d => d._id.toString() === id.toString())?._id)
    );
    if (pairings.some(pair => pair.some(id => !id))) {
      res.status(400); throw new Error('Invalid department IDs in pairings');
    }
  } else {
    // Random draw
    const shuffled = shuffle([...departments]);
    pairings = [
      [shuffled[0]._id, shuffled[1]._id],
      [shuffled[2]._id, shuffled[3]._id],
      [shuffled[4]._id, shuffled[5]._id],
      [shuffled[6]._id, shuffled[7]._id],
    ];
  }

  // Create 4 QF matches
  const season = req.body.season || null;
  const qfMatches = await Promise.all(
    pairings.map((pair, i) =>
      Match.create({
        sport: officialEvent.sportId,
        teamA: pair[0],
        teamB: pair[1],
        officialEvent: officialEvent._id,
        bracketRound: 'QF',
        bracketSlot: i + 1,
        matchCategory: 'QUARTER_FINAL',
        status: 'SCHEDULED',
        season,
        venue: officialEvent.venue || '',
      })
    )
  );

  const populated = await Match.find({ _id: { $in: qfMatches.map(m => m._id) } })
    .populate('teamA', 'name shortCode logo')
    .populate('teamB', 'name shortCode logo')
    .lean();

  const io = req.app.get('io');
  if (io) io.emit('bracketStarted', { eventNumber, officialEvent: officialEvent._id });

  res.status(201).json({
    success: true,
    message: `Bracket started for ${officialEvent.name} — 4 QF matches created`,
    data: await buildBracketSnapshot(officialEvent),
  });
});

/**
 * @desc    Complete a bracket match and advance the bracket.
 *          Auto-generates next round when all matches in a round are done.
 *          Auto-awards points when both LM and FINAL are complete.
 * @route   POST /api/brackets/match/:matchId/complete
 * @body    { winnerId, scoreA?, scoreB?, summary? }
 */
const completeMatch = asyncHandler(async (req, res) => {
  const { winnerId, scoreA, scoreB, summary } = req.body;
  if (!winnerId) { res.status(400); throw new Error('winnerId is required'); }

  const match = await Match.findById(req.params.matchId)
    .populate('officialEvent')
    .populate('teamA', 'name shortCode')
    .populate('teamB', 'name shortCode');

  if (!match) { res.status(404); throw new Error('Match not found'); }
  if (!match.officialEvent) { res.status(400); throw new Error('This match has no officialEvent — use regular match update'); }
  if (match.status === 'COMPLETED') { res.status(400); throw new Error('Match already completed'); }

  const winnerObjId = new mongoose.Types.ObjectId(winnerId);
  if (
    match.teamA._id.toString() !== winnerId &&
    match.teamB._id.toString() !== winnerId
  ) {
    res.status(400); throw new Error('Winner must be one of the two teams');
  }

  // Mark complete
  match.status = 'COMPLETED';
  match.winner = winnerObjId;
  match.scoreA = scoreA ?? match.scoreA;
  match.scoreB = scoreB ?? match.scoreB;
  match.summary = summary ?? match.summary;
  await match.save();

  const oe = match.officialEvent;
  const io = req.app.get('io');
  if (io) io.emit('bracketMatchCompleted', { matchId: match._id, eventNumber: oe.eventNumber, round: match.bracketRound });

  // ── Advance bracket ──────────────────────────────────────────────────────
  if (match.bracketRound === 'QF') {
    const allQF = await Match.find({ officialEvent: oe._id, bracketRound: 'QF' });
    if (allQF.every(m => m.status === 'COMPLETED')) {
      // All QF done — create 2 SF matches
      const sorted = allQF.sort((a, b) => a.bracketSlot - b.bracketSlot);
      // SF1: QF1 winner vs QF2 winner; SF2: QF3 winner vs QF4 winner
      await Promise.all([
        Match.create({
          sport: oe.sportId, officialEvent: oe._id,
          teamA: sorted[0].winner, teamB: sorted[1].winner,
          bracketRound: 'SF', bracketSlot: 1,
          matchCategory: 'SEMIFINAL', status: 'SCHEDULED',
          venue: oe.venue || '', season: match.season,
        }),
        Match.create({
          sport: oe.sportId, officialEvent: oe._id,
          teamA: sorted[2].winner, teamB: sorted[3].winner,
          bracketRound: 'SF', bracketSlot: 2,
          matchCategory: 'SEMIFINAL', status: 'SCHEDULED',
          venue: oe.venue || '', season: match.season,
        }),
      ]);
      if (io) io.emit('bracketRoundCreated', { eventNumber: oe.eventNumber, round: 'SF' });
    }
  } else if (match.bracketRound === 'SF') {
    const allSF = await Match.find({ officialEvent: oe._id, bracketRound: 'SF' });
    if (allSF.every(m => m.status === 'COMPLETED')) {
      const sorted = allSF.sort((a, b) => a.bracketSlot - b.bracketSlot);
      const sf1Winner = sorted[0].winner;
      const sf1Loser = sorted[0].teamA.toString() === sf1Winner.toString() ? sorted[0].teamB : sorted[0].teamA;
      const sf2Winner = sorted[1].winner;
      const sf2Loser = sorted[1].teamA.toString() === sf2Winner.toString() ? sorted[1].teamB : sorted[1].teamA;

      await Promise.all([
        // LM: losers battle for 3rd place
        Match.create({
          sport: oe.sportId, officialEvent: oe._id,
          teamA: sf1Loser, teamB: sf2Loser,
          bracketRound: 'LM', bracketSlot: 1,
          matchCategory: 'REGULAR', status: 'SCHEDULED',
          venue: oe.venue || '', season: match.season,
          notes: '3rd place match',
        }),
        // Final
        Match.create({
          sport: oe.sportId, officialEvent: oe._id,
          teamA: sf1Winner, teamB: sf2Winner,
          bracketRound: 'FINAL', bracketSlot: 1,
          matchCategory: 'FINAL', status: 'SCHEDULED',
          venue: oe.venue || '', season: match.season,
        }),
      ]);
      if (io) io.emit('bracketRoundCreated', { eventNumber: oe.eventNumber, round: 'LM+FINAL' });
    }
  } else if (match.bracketRound === 'LM' || match.bracketRound === 'FINAL') {
    // Check if BOTH LM and FINAL are complete → award points
    const [lmMatch] = await Match.find({ officialEvent: oe._id, bracketRound: 'LM' });
    const [finalMatch] = await Match.find({ officialEvent: oe._id, bracketRound: 'FINAL' });

    if (lmMatch?.status === 'COMPLETED' && finalMatch?.status === 'COMPLETED') {
      await _awardBracketPoints(oe, req.app.get('io'), req.admin?._id);
    }
  }

  const snapshot = await buildBracketSnapshot(oe);
  res.json({ success: true, message: 'Match completed', data: snapshot });
});

/**
 * Internal function: award points to all 8 departments after bracket completes.
 */
async function _awardBracketPoints(oe, io, adminId) {
  // Guard: only award once
  const anyAwarded = await Match.findOne({ officialEvent: oe._id, pointsAwarded: true });
  if (anyAwarded) return;

  const allMatches = await Match.find({ officialEvent: oe._id });
  const [finalMatch] = allMatches.filter(m => m.bracketRound === 'FINAL');
  const [lmMatch] = allMatches.filter(m => m.bracketRound === 'LM');
  const qfMatches = allMatches.filter(m => m.bracketRound === 'QF').sort((a, b) => a.bracketSlot - b.bracketSlot);

  // Determine 8 positions
  const p1 = finalMatch.winner;
  const p2 = finalMatch.teamA.toString() === p1.toString() ? finalMatch.teamB : finalMatch.teamA;
  const p3 = lmMatch.winner;
  const p4 = lmMatch.teamA.toString() === p3.toString() ? lmMatch.teamB : lmMatch.teamA;
  // QF losers → P5–P8 in slot order
  const qfLosers = qfMatches.map(m =>
    m.teamA.toString() === m.winner.toString() ? m.teamB : m.teamA
  );

  const positionMap = [
    { dept: p1, position: 1 },
    { dept: p2, position: 2 },
    { dept: p3, position: 3 },
    { dept: p4, position: 4 },
    ...qfLosers.map((d, i) => ({ dept: d, position: 5 + i })),
  ];

  const positionLabels = { 1: 'Winner', 2: 'Runner-up', 3: '2nd Runner-up', 4: '4th Place' };
  const pointsMap = oe.positions instanceof Map ? oe.positions : new Map(Object.entries(oe.positions));
  const logCategory = CATEGORY_MAP[oe.category] || 'Sports';

  for (const { dept, position } of positionMap) {
    const pts = Number(pointsMap.get(String(position)) ?? 0);
    if (pts > 0) {
      await PointLog.create({
        department: dept,
        points: pts,
        category: logCategory,
        eventName: oe.name,
        position: positionLabels[position] || `Position ${position}`,
        description: `${oe.name} — Bracket Event #${oe.eventNumber} (Position ${position})`,
        awardedBy: adminId || null,
      });
    }
  }

  // Mark all bracket matches as pointsAwarded
  await Match.updateMany({ officialEvent: oe._id }, { pointsAwarded: true });

  clearCache('leaderboard');
  if (io) io.emit('leaderboardUpdate', { source: 'bracket', eventNumber: oe.eventNumber });
  if (io) io.emit('bracketAwarded', { eventNumber: oe.eventNumber, officialEvent: oe._id });
}

/**
 * @desc    Manually trigger point award (for already-complete brackets that weren't auto-awarded)
 * @route   POST /api/brackets/:eventNumber/award
 * @access  Private (Admin)
 */
const awardBracketPoints = asyncHandler(async (req, res) => {
  const eventNumber = Number(req.params.eventNumber);
  const oe = await OfficialEvent.findOne({ eventNumber });
  if (!oe) { res.status(404); throw new Error(`Event #${eventNumber} not found`); }

  const [lmMatch] = await Match.find({ officialEvent: oe._id, bracketRound: 'LM' });
  const [finalMatch] = await Match.find({ officialEvent: oe._id, bracketRound: 'FINAL' });

  if (!lmMatch || lmMatch.status !== 'COMPLETED') {
    res.status(400); throw new Error('LM (3rd place match) not yet completed');
  }
  if (!finalMatch || finalMatch.status !== 'COMPLETED') {
    res.status(400); throw new Error('Final match not yet completed');
  }
  if (await Match.findOne({ officialEvent: oe._id, pointsAwarded: true })) {
    res.status(400); throw new Error('Points already awarded for this bracket');
  }

  await _awardBracketPoints(oe, req.app.get('io'), req.admin?._id);

  res.json({ success: true, message: `Points awarded for ${oe.name}` });
});

/**
 * @desc    Get current bracket state for an event
 * @route   GET /api/brackets/:eventNumber
 * @access  Public
 */
const getBracket = asyncHandler(async (req, res) => {
  const eventNumber = Number(req.params.eventNumber);
  const oe = await OfficialEvent.findOne({ eventNumber }).lean();
  if (!oe) { res.status(404); throw new Error(`Event #${eventNumber} not found`); }

  const snapshot = await buildBracketSnapshot(oe);
  res.json({ success: true, data: { ...snapshot, officialEvent: oe } });
});

/**
 * @desc    Reset (delete) all matches for a bracket event (allows restart)
 * @route   DELETE /api/brackets/:eventNumber/reset
 * @access  Private (Admin)
 */
const resetBracket = asyncHandler(async (req, res) => {
  const eventNumber = Number(req.params.eventNumber);
  const oe = await OfficialEvent.findOne({ eventNumber });
  if (!oe) { res.status(404); throw new Error(`Event #${eventNumber} not found`); }

  // Prevent reset if points already awarded (safety guard)
  const awarded = await Match.findOne({ officialEvent: oe._id, pointsAwarded: true });
  if (awarded && !req.body.force) {
    res.status(400);
    throw new Error('Points already awarded for this bracket. Pass { force: true } to override and reset.');
  }

  await Match.deleteMany({ officialEvent: oe._id });

  const io = req.app.get('io');
  if (io) io.emit('bracketReset', { eventNumber });

  res.json({ success: true, message: `Bracket for ${oe.name} has been reset` });
});

/**
 * @desc    Get all brackets summary (list all bracket events with their status)
 * @route   GET /api/brackets
 * @access  Public
 */
const listBrackets = asyncHandler(async (req, res) => {
  const bracketEvents = await OfficialEvent.find({ type: 'BRACKET', isActive: true })
    .sort({ eventNumber: 1 })
    .lean();

  const summaries = await Promise.all(
    bracketEvents.map(async (oe) => {
      const matchCount = await Match.countDocuments({ officialEvent: oe._id });
      const completedCount = await Match.countDocuments({ officialEvent: oe._id, status: 'COMPLETED' });
      const awarded = await Match.findOne({ officialEvent: oe._id, pointsAwarded: true });
      return {
        eventNumber: oe.eventNumber,
        name: oe.name,
        sportId: oe.sportId,
        positions: Object.fromEntries(oe.positions),
        matchCount,
        completedCount,
        status: matchCount === 0 ? 'NOT_STARTED' : awarded ? 'AWARDED' : completedCount === 7 ? 'COMPLETE' : 'IN_PROGRESS',
      };
    })
  );

  res.json({ success: true, data: summaries });
});

module.exports = {
  startBracket,
  completeMatch,
  awardBracketPoints,
  getBracket,
  resetBracket,
  listBrackets,
};
