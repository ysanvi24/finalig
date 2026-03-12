import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Trophy, Brackets, BarChart3, Search, Filter, ExternalLink, Medal } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  TEAM_SPORT: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Team Sport' },
  INDIVIDUAL_SPORT: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', label: 'Individual Sport' },
  ESPORT: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', label: 'E-Sport' },
  CULTURAL: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', label: 'Cultural' },
  LITERARY: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'Literary' },
  MUSIC: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', label: 'Music' },
  ART: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Art' },
  DANCE: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', label: 'Dance' },
  DRAMA: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', label: 'Drama' },
  QUIZ: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', label: 'Quiz' },
  SOCIAL: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', label: 'Social' },
};

const POSITION_COLORS = ['text-yellow-400', 'text-slate-300', 'text-amber-600', 'text-blue-400', 'text-slate-400', 'text-slate-400', 'text-slate-400', 'text-slate-400'];
const POSITION_LABELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

const ScoringPresets = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/official-events');
      setEvents(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load official events');
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter(ev => {
    const matchesSearch = ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(ev.eventNumber).includes(searchQuery);
    const matchesType = filterType === 'ALL' || ev.type === filterType;
    const matchesCategory = filterCategory === 'ALL' || ev.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = [...new Set(events.map(e => e.category))].filter(Boolean);

  const getPoints = (ev, pos) => {
    if (!ev.positions) return 0;
    return ev.positions[String(pos)] ?? ev.positions[pos] ?? 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--border-color)] border-t-[var(--color-accent)] rounded-full animate-spin"></div>
      </div>
    );
  }

  const bracketCount = events.filter(e => e.type === 'BRACKET').length;
  const groupCount = events.filter(e => e.type === 'GROUP').length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Trophy className="w-7 h-7 md:w-9 md:h-9 text-[var(--color-accent)]" />
              Official Scoring Table
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              All {events.length} official IG events — points awarded automatically
            </p>
          </div>
          <button
            onClick={() => navigate('/shashwatam-control-2026/bracket-manager')}
            className="px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)] transition-all text-sm md:text-base"
          >
            <ExternalLink className="w-4 h-4" />
            Bracket Manager
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-[var(--color-accent)]">{events.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Total Events</div>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{bracketCount}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Bracket Events</div>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{groupCount}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Group Events</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'BRACKET', 'GROUP'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  filterType === type
                    ? 'bg-[var(--color-accent)] text-[var(--bg-primary)] border-[var(--color-accent)]'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--color-accent)]'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type === 'BRACKET' ? '🏆 Bracket' : '📊 Group'}
              </button>
            ))}
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] text-sm focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{CATEGORY_COLORS[cat]?.label || cat}</option>
            ))}
          </select>
        </div>

        {/* Events Table */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold w-12">#</th>
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold">Event</th>
                  <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold">Category</th>
                  <th className="text-center px-3 py-3 text-[var(--text-muted)] font-semibold">Type</th>
                  {POSITION_LABELS.map((lbl, i) => (
                    <th key={lbl} className={`text-center px-2 py-3 font-bold ${POSITION_COLORS[i]} w-10`}>{lbl}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, idx) => {
                  const catStyle = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.SOCIAL;
                  return (
                    <tr
                      key={ev._id || ev.eventNumber}
                      className="border-b border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    >
                      <td className="px-4 py-3 text-[var(--text-muted)] font-mono">{ev.eventNumber}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[var(--text-primary)]">{ev.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}>
                          {catStyle.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {ev.type === 'BRACKET' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            🏆 Bracket
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400">
                            📊 Group
                          </span>
                        )}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((pos, i) => {
                        const pts = getPoints(ev, pos);
                        return (
                          <td key={pos} className="px-2 py-3 text-center">
                            <span className={`font-bold text-sm ${pts > 0 ? POSITION_COLORS[i] : 'text-[var(--text-muted)]'}`}>
                              {pts > 0 ? pts : '—'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={13} className="text-center py-12 text-[var(--text-muted)]">
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <Medal className="w-4 h-4 text-[var(--color-accent)]" />
            Bracket Events (1–19): QF → SF → LM → Final (8 depts → P1–P8 auto-awarded)
          </h3>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
            <span><span className="font-bold text-yellow-400">P1</span> = Final Winner</span>
            <span><span className="font-bold text-slate-300">P2</span> = Final Runner-Up</span>
            <span><span className="font-bold text-amber-600">P3</span> = 3rd Place (LM Winner)</span>
            <span><span className="font-bold text-blue-400">P4</span> = LM Loser</span>
            <span><span className="font-bold text-slate-400">P5–P8</span> = QF Losers</span>
          </div>
          <div className="mt-2 text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-purple-400">Group Events (20–78):</span> Admin assigns ranks 1–8 → points auto-filled from this table
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringPresets;
