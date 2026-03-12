import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle, Edit3, Trash2, Search, Filter, Save, X, AlertCircle } from 'lucide-react';
import SportBadge from '../../components/SportBadge';
import { STATUS_CONFIG } from '../../lib/constants';
import { getMatchSportsForSelect } from '../../config/sportsRegistry';

const MATCH_SPORT_OPTIONS = getMatchSportsForSelect();

const STATUS_COLORS = {
 SCHEDULED: STATUS_CONFIG.SCHEDULED.color,
 COMPLETED: STATUS_CONFIG.COMPLETED.color,
 CANCELLED: STATUS_CONFIG.CANCELLED.color
};

const LiveConsole = () => {
 const [matches, setMatches] = useState([]);
 const [loading, setLoading] = useState(true);
 const [editingMatch, setEditingMatch] = useState(null);
 const [editForm, setEditForm] = useState({});
 const [filterSport, setFilterSport] = useState('ALL');
 const [filterStatus, setFilterStatus] = useState('ALL');
 const [searchQuery, setSearchQuery] = useState('');
 const [saving, setSaving] = useState(false);

 const fetchMatches = async () => {
  try {
   setLoading(true);
   const res = await api.get('/matches');
   setMatches(res.data.data || []);
  } catch (err) { toast.error('Failed to load matches'); }
  finally { setLoading(false); }
 };

 useEffect(() => { fetchMatches(); }, []);

 // Real-time socket listeners for live updates
 useEffect(() => {
  const handleMatchUpdate = (match) => {
   if (!match?._id) return;
   setMatches(prev => prev.map(m => m._id === match._id ? { ...m, ...match } : m));
  };
  const handleMatchCreated = (match) => {
   if (!match?._id) return;
   setMatches(prev => {
    if (prev.some(m => m._id === match._id)) return prev;
    return [match, ...prev];
   });
  };
  const handleMatchDeleted = (data) => {
   const matchId = data?.matchId || data?._id;
   if (!matchId) return;
   setMatches(prev => prev.filter(m => m._id !== matchId));
  };
  const handleReconnect = () => fetchMatches();

  socket.on('matchUpdate', handleMatchUpdate);
  socket.on('matchCreated', handleMatchCreated);
  socket.on('matchDeleted', handleMatchDeleted);
  socket.io.on('reconnect', handleReconnect);

  return () => {
   socket.off('matchUpdate', handleMatchUpdate);
   socket.off('matchCreated', handleMatchCreated);
   socket.off('matchDeleted', handleMatchDeleted);
   socket.io.off('reconnect', handleReconnect);
  };
 }, []);

 const startEdit = (match) => {
  setEditingMatch(match._id);
  setEditForm({
   scoreA: match.scoreA || '',
   scoreB: match.scoreB || '',
   winner: match.winner?._id || match.winner || '',
   status: match.status || 'SCHEDULED',
   summary: match.summary || ''
  });
 };

 const cancelEdit = () => { setEditingMatch(null); setEditForm({}); };

 const saveResult = async (matchId) => {
  setSaving(true);
  try {
   const payload = { ...editForm };
   if (!payload.winner) delete payload.winner;
   const res = await api.put(`/matches/${matchId}`, payload);
   toast.success('Match updated!');
   // Instantly update local state
   setMatches(prev => prev.map(m => m._id === matchId ? { ...m, ...payload, ...(res.data?.data || {}) } : m));
   setEditingMatch(null);
   setEditForm({});
  } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  finally { setSaving(false); }
 };

 const deleteMatch = async (matchId) => {
  if (!window.confirm('Delete this match?')) return;
  try {
   await api.delete(`/matches/${matchId}`);
   // Instantly remove from local state
   setMatches(prev => prev.filter(m => m._id !== matchId));
   toast.success('Match deleted');
  } catch (err) { toast.error('Failed to delete match'); }
 };

 const filteredMatches = matches.filter(m => {
  if (filterSport !== 'ALL' && m.sport !== filterSport) return false;
  if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
  if (searchQuery) {
   const q = searchQuery.toLowerCase();
   const teamAName = m.teamA?.name?.toLowerCase() || m.teamA?.shortCode?.toLowerCase() || '';
   const teamBName = m.teamB?.name?.toLowerCase() || m.teamB?.shortCode?.toLowerCase() || '';
   if (!teamAName.includes(q) && !teamBName.includes(q) && !m.sport?.toLowerCase().includes(q)) return false;
  }
  return true;
 });

 const getTeamName = (team) => team?.shortCode || team?.name || 'TBD';

 return (
  <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-6">
   <div className="max-w-4xl mx-auto">
    {/* Header */}
    <div className="mb-6">
     <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
      <Trophy className="w-6 h-6 text-amber-500" />
      Match Manager
     </h1>
     <p className="text-sm text-[var(--text-secondary)] mt-1">Update scores and results for completed matches</p>
    </div>

    {/* Filters */}
    <div className="flex flex-wrap gap-3 mb-6">
     <div className="flex items-center gap-2 flex-1 min-w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2">
      <Search className="w-4 h-4 text-[var(--text-muted)]" />
      <input type="text" placeholder="Search teams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
       className="flex-1 outline-none text-sm text-[var(--text-primary)] placeholder-slate-400 bg-transparent" />
     </div>
     <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)}
      className="w-full sm:w-auto px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] outline-none">
      <option value="ALL">All Sports</option>
      {MATCH_SPORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
     </select>
     <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
      className="w-full sm:w-auto px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] outline-none">
      <option value="ALL">All Status</option>
      <option value="SCHEDULED">Scheduled</option>
      <option value="COMPLETED">Completed</option>
      <option value="CANCELLED">Cancelled</option>
     </select>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-3 mb-6">
     {[
      { label: 'Total', count: matches.length, color: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--border-color)]' },
      { label: 'Scheduled', count: matches.filter(m => m.status === 'SCHEDULED').length, color: 'bg-[rgba(251,191,36,0.1)] text-amber-400 border-[rgba(251,191,36,0.2)]' },
      { label: 'Completed', count: matches.filter(m => m.status === 'COMPLETED').length, color: 'bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.2)]' }
     ].map(stat => (
      <div key={stat.label} className={`p-3 rounded-lg border text-center ${stat.color}`}>
       <div className="text-2xl font-bold">{stat.count}</div>
       <div className="text-xs font-medium">{stat.label}</div>
      </div>
     ))}
    </div>

    {/* Match List */}
    {loading ? (
     <div className="text-center py-12 text-[var(--text-muted)]">Loading matches...</div>
    ) : filteredMatches.length === 0 ? (
     <div className="text-center py-12 text-[var(--text-muted)]">
      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
      <p>No matches found</p>
     </div>
    ) : (
     <div className="space-y-3">
      <AnimatePresence>
       {filteredMatches.map((match) => (
        <motion.div key={match._id}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -10 }}
         className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">

         {/* Match Header */}
         <div className="p-4">
          <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
            <SportBadge sport={match.sport} size="sm" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">{match.sport}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[match.status] || ''}`}>
             {match.status}
            </span>
            {match.matchCategory && match.matchCategory !== 'REGULAR' && (
             <span className="px-2 py-0.5 rounded-full text-xs bg-[rgba(168,85,247,0.15)] text-purple-400 border border-[rgba(168,85,247,0.3)]">
              {match.matchCategory.replace('_', ' ')}
             </span>
            )}
           </div>
           <div className="flex gap-1">
            <button onClick={() => editingMatch === match._id ? cancelEdit() : startEdit(match)}
             className="p-2.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors">
             {editingMatch === match._id ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
            <button onClick={() => deleteMatch(match._id)}
             className="p-2.5 rounded-lg hover:bg-[rgba(248,113,113,0.1)] text-red-400 hover:text-[#f87171] transition-colors">
             <Trash2 className="w-4 h-4" />
            </button>
           </div>
          </div>

          {/* Teams Display */}
          <div className="flex items-center justify-between">
           <div className="flex-1 text-center">
            <div className={`text-xl font-bold ${match.winner && (match.winner._id || match.winner) === (match.teamA?._id) ? 'text-[#4ade80]' : 'text-[var(--text-primary)]'}`}>
             {getTeamName(match.teamA)}
            </div>
            {match.scoreA && <div className="text-lg font-semibold text-[var(--color-accent)] mt-0.5">{match.scoreA}</div>}
           </div>
           <div className="px-4 text-[var(--text-muted)] font-bold text-sm">VS</div>
           <div className="flex-1 text-center">
            <div className={`text-xl font-bold ${match.winner && (match.winner._id || match.winner) === (match.teamB?._id) ? 'text-[#4ade80]' : 'text-[var(--text-primary)]'}`}>
             {getTeamName(match.teamB)}
            </div>
            {match.scoreB && <div className="text-lg font-semibold text-[var(--color-accent)] mt-0.5">{match.scoreB}</div>}
           </div>
          </div>

          {match.summary && (
           <div className="mt-2 text-xs text-[var(--text-secondary)] text-center italic">{match.summary}</div>
          )}

          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
           {match.venue && <span>📍 {match.venue}</span>}
           {match.scheduledAt && <span>📅 {new Date(match.scheduledAt).toLocaleDateString()}</span>}
          </div>
         </div>

         {/* Edit Form */}
         <AnimatePresence>
          {editingMatch === match._id && (
           <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--border-color)] overflow-hidden">
            <div className="p-4 bg-[var(--bg-primary)] space-y-3">
             <div className="grid grid-cols-2 gap-3">
              <div>
               <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {getTeamName(match.teamA)} Score
               </label>
               <input type="text" value={editForm.scoreA} placeholder="e.g. 156/4, 3-1"
                onChange={(e) => setEditForm(prev => ({ ...prev, scoreA: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
              </div>
              <div>
               <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                {getTeamName(match.teamB)} Score
               </label>
               <input type="text" value={editForm.scoreB} placeholder="e.g. 142/8, 2-1"
                onChange={(e) => setEditForm(prev => ({ ...prev, scoreB: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
              </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
              <div>
               <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Winner</label>
               <select value={editForm.winner}
                onChange={(e) => setEditForm(prev => ({ ...prev, winner: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
                <option value="">No winner yet</option>
                <option value={match.teamA?._id}>{getTeamName(match.teamA)}</option>
                <option value={match.teamB?._id}>{getTeamName(match.teamB)}</option>
               </select>
              </div>
              <div>
               <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Status</label>
               <select value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]">
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
               </select>
              </div>
             </div>

             <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Summary (optional)</label>
              <input type="text" value={editForm.summary}
               placeholder="e.g. CSE won by 14 runs"
               onChange={(e) => setEditForm(prev => ({ ...prev, summary: e.target.value }))}
               className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
             </div>

             <div className="flex gap-2 pt-1">
              <button onClick={() => saveResult(match._id)} disabled={saving}
               className="flex-1 py-2 bg-[#4ade80] hover:bg-green-600 text-[var(--text-primary)] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
               <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Result'}
              </button>
              <button onClick={cancelEdit}
               className="px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium">
               Cancel
              </button>
             </div>
            </div>
           </motion.div>
          )}
         </AnimatePresence>
        </motion.div>
       ))}
      </AnimatePresence>
     </div>
    )}
   </div>
  </div>
 );
};

export default LiveConsole;
