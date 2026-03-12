import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown, CheckCircle, RefreshCw, Award, Zap, X, ArrowRight } from 'lucide-react';

const DEPTS = ['ARCH', 'CHEMINE', 'CIVIL', 'CSE', 'EEE', 'ECE', 'MECH', 'META'];
const DEPT_COLORS = {
  ARCH: 'text-pink-400', CHEMINE: 'text-lime-400', CIVIL: 'text-amber-400',
  CSE: 'text-blue-400', EEE: 'text-yellow-400', ECE: 'text-cyan-400',
  MECH: 'text-orange-400', META: 'text-purple-400',
};

const ROUND_LABELS = { QF: 'Quarter-Finals', SF: 'Semi-Finals', LM: '3rd Place', FINAL: 'Final' };
const ROUND_ORDER = ['QF', 'SF', 'LM', 'FINAL'];

const MatchCard = ({ match, departments, onComplete, readOnly }) => {
  const [winnerId, setWinnerId] = useState('');
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [saving, setSaving] = useState(false);

  const deptA = departments.find(d => d._id === (match.teamA?._id || match.teamA));
  const deptB = departments.find(d => d._id === (match.teamB?._id || match.teamB));
  const winner = departments.find(d => d._id === (match.winner?._id || match.winner));
  const isCompleted = match.status === 'COMPLETED';

  const handleComplete = async () => {
    if (!winnerId) { toast.error('Select a winner'); return; }
    setSaving(true);
    try {
      await onComplete(match._id, { winnerId, scoreA: Number(scoreA) || 0, scoreB: Number(scoreB) || 0 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-[var(--bg-secondary)] border rounded-xl p-4 ${isCompleted ? 'border-green-500/30' : 'border-[var(--border-color)]'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {ROUND_LABELS[match.bracketRound]} — Slot {match.bracketSlot}
        </span>
        {isCompleted && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Done</span>}
      </div>

      <div className="flex items-center gap-2">
        {/* Team A */}
        <div className={`flex-1 p-2 rounded-lg border text-center text-sm font-semibold transition-all ${
          isCompleted && winner?._id === (match.teamA?._id || match.teamA)
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]'
        }`}>
          <span className={DEPT_COLORS[deptA?.shortCode] || 'text-[var(--text-primary)]'}>
            {deptA?.shortCode || '—'}
          </span>
          {isCompleted && <div className="text-lg font-bold">{match.scoreA ?? 0}</div>}
        </div>

        <div className="text-[var(--text-muted)] text-xs font-bold">VS</div>

        {/* Team B */}
        <div className={`flex-1 p-2 rounded-lg border text-center text-sm font-semibold transition-all ${
          isCompleted && winner?._id === (match.teamB?._id || match.teamB)
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)]'
        }`}>
          <span className={DEPT_COLORS[deptB?.shortCode] || 'text-[var(--text-primary)]'}>
            {deptB?.shortCode || '—'}
          </span>
          {isCompleted && <div className="text-lg font-bold">{match.scoreB ?? 0}</div>}
        </div>
      </div>

      {isCompleted && winner && (
        <div className="mt-2 text-center text-xs text-green-400 font-medium">
          🏆 Winner: {winner.shortCode}
        </div>
      )}

      {!isCompleted && !readOnly && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={scoreA} onChange={e => setScoreA(e.target.value)}
              placeholder={`${deptA?.shortCode || 'A'} score`}
              className="px-2 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs text-[var(--text-primary)] outline-none" />
            <div className="flex items-center justify-center text-xs text-[var(--text-muted)]">Score</div>
            <input type="number" value={scoreB} onChange={e => setScoreB(e.target.value)}
              placeholder={`${deptB?.shortCode || 'B'} score`}
              className="px-2 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-xs text-[var(--text-primary)] outline-none" />
          </div>
          <select value={winnerId} onChange={e => setWinnerId(e.target.value)}
            className="w-full px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] outline-none">
            <option value="">Select winner…</option>
            {deptA && <option value={deptA._id}>{deptA.shortCode}</option>}
            {deptB && <option value={deptB._id}>{deptB.shortCode}</option>}
          </select>
          <button onClick={handleComplete} disabled={saving || !winnerId}
            className="w-full py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</> : <><CheckCircle className="w-3.5 h-3.5" /> Complete Match</>}
          </button>
        </div>
      )}
    </div>
  );
};

const BracketManager = () => {
  const [bracketEvents, setBracketEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // QF pairing state — 4 matchups
  const [pairings, setPairings] = useState([
    { teamA: '', teamB: '' },
    { teamA: '', teamB: '' },
    { teamA: '', teamB: '' },
    { teamA: '', teamB: '' },
  ]);
  const [startingBracket, setStartingBracket] = useState(false);
  const [awardingPoints, setAwardingPoints] = useState(false);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, deptRes] = await Promise.all([
          axios.get('/official-events?type=BRACKET'),
          axios.get('/departments'),
        ]);
        setBracketEvents(evRes.data.data || []);
        setDepartments(deptRes.data.data || deptRes.data || []);
      } catch {
        toast.error('Failed to load events/departments');
      }
    };
    load();
  }, []);

  // Load bracket for selected event
  const loadBracket = useCallback(async (eventNumber) => {
    if (!eventNumber) return;
    setLoading(true);
    try {
      const res = await axios.get(`/brackets/${eventNumber}`);
      setBracket(res.data.data || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setBracket(null);
      } else {
        toast.error('Failed to load bracket');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadBracket(selectedEvent.eventNumber);
    } else {
      setBracket(null);
    }
  }, [selectedEvent, loadBracket]);

  const handleStartBracket = async () => {
    const filled = pairings.filter(p => p.teamA && p.teamB);
    if (filled.length !== 4) { toast.error('Fill all 4 QF pairings'); return; }
    // Check no duplicate teams
    const allTeams = pairings.flatMap(p => [p.teamA, p.teamB]);
    if (new Set(allTeams).size !== 8) { toast.error('Each department must appear exactly once'); return; }

    setStartingBracket(true);
    try {
      await axios.post(`/brackets/${selectedEvent.eventNumber}/start`, { pairings });
      toast.success('Bracket started!');
      loadBracket(selectedEvent.eventNumber);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start bracket');
    } finally {
      setStartingBracket(false);
    }
  };

  const handleCompleteMatch = async (matchId, data) => {
    try {
      const res = await axios.post(`/brackets/match/${matchId}/complete`, data);
      toast.success('Match completed!');
      setBracket(res.data.data || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete match');
    }
  };

  const handleAwardPoints = async () => {
    if (!window.confirm('Award points for this bracket? This cannot be undone.')) return;
    setAwardingPoints(true);
    try {
      await axios.post(`/brackets/${selectedEvent.eventNumber}/award`);
      toast.success('Points awarded to all departments!');
      loadBracket(selectedEvent.eventNumber);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to award points');
    } finally {
      setAwardingPoints(false);
    }
  };

  const handleResetBracket = async () => {
    if (!window.confirm('Reset this bracket? All match records will be deleted (points already awarded are NOT reversed).')) return;
    try {
      await axios.delete(`/brackets/${selectedEvent.eventNumber}/reset`);
      toast.success('Bracket reset');
      setBracket(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset bracket');
    }
  };

  const handleSeedDB = async () => {
    setSeeding(true);
    try {
      await axios.post('/official-events/seed');
      toast.success('Official events seeded to database!');
      const res = await axios.get('/official-events?type=BRACKET');
      setBracketEvents(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  // Group bracket matches by round
  const matchesByRound = {};
  if (bracket?.matches) {
    for (const m of bracket.matches) {
      if (!matchesByRound[m.bracketRound]) matchesByRound[m.bracketRound] = [];
      matchesByRound[m.bracketRound].push(m);
      matchesByRound[m.bracketRound].sort((a, b) => a.bracketSlot - b.bracketSlot);
    }
  }

  const bracketComplete = bracket?.matches?.length >= 7 &&
    bracket.matches.filter(m => m.bracketRound === 'FINAL' || m.bracketRound === 'LM').every(m => m.status === 'COMPLETED');
  const pointsAlreadyAwarded = bracket?.matches?.some(m => m.pointsAwarded);
  const usedDepts = new Set(pairings.flatMap(p => [p.teamA, p.teamB]).filter(Boolean));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Trophy className="w-7 h-7 text-[var(--color-accent)]" />
              Bracket Manager
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">
              QF → SF → 3rd Place → Final for events 1–19
            </p>
          </div>
          <button onClick={handleSeedDB} disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-accent)] transition-all disabled:opacity-50">
            <Zap className="w-4 h-4" />
            {seeding ? 'Seeding…' : 'Seed Events DB'}
          </button>
        </div>

        {/* Event Selector */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 mb-6">
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
            Select Bracket Event (1–19)
          </label>
          <select
            value={selectedEvent?.eventNumber || ''}
            onChange={e => {
              const ev = bracketEvents.find(x => x.eventNumber === Number(e.target.value));
              setSelectedEvent(ev || null);
              setBracket(null);
              setPairings([{ teamA: '', teamB: '' }, { teamA: '', teamB: '' }, { teamA: '', teamB: '' }, { teamA: '', teamB: '' }]);
            }}
            className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-sm"
          >
            <option value="">-- Choose an event --</option>
            {bracketEvents.map(ev => (
              <option key={ev.eventNumber} value={ev.eventNumber}>
                #{ev.eventNumber} — {ev.name}
              </option>
            ))}
          </select>
          {bracketEvents.length === 0 && (
            <p className="text-xs text-amber-400 mt-2">⚠ No events loaded. Click "Seed Events DB" above first.</p>
          )}
        </div>

        {selectedEvent && (
          <>
            {/* Event Info Banner */}
            <div className="flex items-center gap-4 p-4 bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 rounded-xl mb-6">
              <Trophy className="w-6 h-6 text-[var(--color-accent)] shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-[var(--text-primary)]">Event #{selectedEvent.eventNumber}: {selectedEvent.name}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  P1: {selectedEvent.positions?.['1'] ?? '—'} pts | P2: {selectedEvent.positions?.['2'] ?? '—'} pts | P3: {selectedEvent.positions?.['3'] ?? '—'} pts | P4: {selectedEvent.positions?.['4'] ?? '—'} pts
                </div>
              </div>
              {bracket && (
                <button onClick={handleResetBracket}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-all">
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-3"></div>
                Loading bracket…
              </div>
            ) : !bracket ? (
              /* ─── Setup QF Pairings ─── */
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                  Set Up Quarter-Final Pairings
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-5">
                  Assign all 8 departments to 4 QF matches (each dept used exactly once).
                </p>

                <div className="space-y-4">
                  {pairings.map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[var(--text-muted)] w-12 shrink-0">QF {idx + 1}</span>
                      <select value={pair.teamA} onChange={e => setPairings(prev => prev.map((p, i) => i === idx ? { ...p, teamA: e.target.value } : p))}
                        className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
                        <option value="">Team A…</option>
                        {departments.map(d => (
                          <option key={d._id} value={d._id} disabled={usedDepts.has(d._id) && pair.teamA !== d._id}>
                            {d.shortCode} — {d.name}
                          </option>
                        ))}
                      </select>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                      <select value={pair.teamB} onChange={e => setPairings(prev => prev.map((p, i) => i === idx ? { ...p, teamB: e.target.value } : p))}
                        className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
                        <option value="">Team B…</option>
                        {departments.map(d => (
                          <option key={d._id} value={d._id} disabled={usedDepts.has(d._id) && pair.teamB !== d._id}>
                            {d.shortCode} — {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Dept usage preview */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {departments.map(d => (
                    <span key={d._id} className={`px-2 py-1 rounded-full text-xs font-semibold border transition-all ${
                      usedDepts.has(d._id)
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-muted)]'
                    }`}>
                      {d.shortCode}
                    </span>
                  ))}
                  <span className="text-xs text-[var(--text-muted)] self-center ml-1">
                    {usedDepts.size}/8 assigned
                  </span>
                </div>

                <button onClick={handleStartBracket} disabled={startingBracket || usedDepts.size !== 8}
                  className="mt-6 w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                  {startingBracket ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting…</> : <><Zap className="w-4 h-4" /> Start Bracket</>}
                </button>
              </div>
            ) : (
              /* ─── Active Bracket View ─── */
              <div className="space-y-8">
                {ROUND_ORDER.filter(r => matchesByRound[r]).map(round => (
                  <div key={round}>
                    <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
                      {ROUND_LABELS[round]}
                    </h2>
                    <div className={`grid gap-4 ${round === 'QF' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {matchesByRound[round].map(match => (
                        <MatchCard
                          key={match._id}
                          match={match}
                          departments={departments}
                          onComplete={handleCompleteMatch}
                          readOnly={pointsAlreadyAwarded}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Award Points CTA */}
                {bracketComplete && !pointsAlreadyAwarded && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                    <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Bracket Complete!</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      All matches done. Award official IG points to all 8 departments.
                    </p>
                    <button onClick={handleAwardPoints} disabled={awardingPoints}
                      className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 mx-auto">
                      {awardingPoints ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Awarding…</> : <><Award className="w-5 h-5" /> Award Points</>}
                    </button>
                  </motion.div>
                )}

                {pointsAlreadyAwarded && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold">Points have been awarded for this event!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!selectedEvent && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Select a bracket event to manage its tournament</p>
            <p className="text-sm mt-2 opacity-60">Events 1–19 use the QF → SF → 3rd Place → Final format</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BracketManager;
