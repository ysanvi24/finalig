import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import { toast } from 'react-hot-toast';
import { RefreshCw, Trophy, TrendingUp, ChevronDown, Pencil, Check, X } from 'lucide-react';

const LeaderboardManagement = () => {
 const [leaderboard, setLeaderboard] = useState([]);
 const [loading, setLoading] = useState(true);  // only for initial load
 const [refreshing, setRefreshing] = useState(false); // soft refresh (no spinner)
 const [expandedRow, setExpandedRow] = useState(null);
 const [editingDept, setEditingDept] = useState(null);
 const [editPoints, setEditPoints] = useState('');
 const [saving, setSaving] = useState(false);

 useEffect(() => {
  fetchLeaderboard(true); // initial load → show spinner
  const handlePointsAwarded = () => fetchLeaderboard(false);
  const handleReset = () => fetchLeaderboard(false);
  socket.on('pointsAwarded', handlePointsAwarded);
  socket.on('leaderboardReset', handleReset);
  return () => { socket.off('pointsAwarded', handlePointsAwarded); socket.off('leaderboardReset', handleReset); };
 }, []);

 const fetchLeaderboard = async (showSpinner = false) => {
  try {
   if (showSpinner) setLoading(true);
   else setRefreshing(true);
   const response = await api.get('/leaderboard/detailed');
   const sorted = (response.data.data || []).sort((a, b) => b.points - a.points);
   setLeaderboard(sorted);
  } catch (err) {
   try {
    const response = await api.get('/leaderboard');
    const sorted = (response.data.data || []).sort((a, b) => b.points - a.points);
    setLeaderboard(sorted);
   } catch (e) { /* ignore fallback error */ }
   if (showSpinner) toast.error('Failed to load leaderboard');
  }
  finally { setLoading(false); setRefreshing(false); }
 };

 const startEditing = (dept) => {
  setEditingDept(dept._id);
  setEditPoints(String(dept.points));
 };

 const cancelEditing = () => {
  setEditingDept(null);
  setEditPoints('');
 };

 const handleSavePoints = async (deptId) => {
  const newPoints = parseInt(editPoints, 10);
  if (isNaN(newPoints) || newPoints < 0) {
   toast.error('Please enter a valid non-negative number');
   return;
  }
  setSaving(true);
  try {
   await api.put(`/leaderboard/department/${deptId}`, { points: newPoints });
   // Optimistic update: patch the local state immediately
   setLeaderboard(prev =>
    prev.map(d => d.departmentId === deptId || d._id === deptId
     ? { ...d, points: newPoints }
     : d
    ).sort((a, b) => b.points - a.points)
   );
   toast.success('Points updated successfully!');
   cancelEditing();
   // Background refresh for full data consistency (socket will also fire)
   fetchLeaderboard(false);
  } catch (err) { toast.error(err.response?.data?.message || 'Failed to update points'); }
  finally { setSaving(false); }
 };

 // Compute actual ranks accounting for ties
 const computeRanks = (data) => {
  const ranks = [];
  let currentRank = 1;
  for (let i = 0; i < data.length; i++) {
   if (i > 0 && data[i].points < data[i - 1].points) {
    currentRank = i + 1;
   }
   ranks.push(currentRank);
  }
  return ranks;
 };

 const getRankBadge = (rank) => rank <= 3 ? rank : `#${rank}`;

 const toggleRow = (id) => {
  setExpandedRow(expandedRow === id ? null : id);
 };

 if (loading) {
  return (
   <div className="min-h-screen bg-[var(--bg-primary)] flex justify-center items-center">
    <div className="text-center">
     <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-4"></div>
     <p className="text-[var(--text-secondary)]">Loading leaderboard...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen bg-[var(--bg-primary)] p-3 sm:p-6 md:p-8">
   {/* Header */}
   <div className="mb-8 flex items-start justify-between">
    <div>
     <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] flex items-center gap-3">
      <Trophy className="w-8 h-8 text-[var(--color-accent)]" />
      Leaderboard Management
     </h1>
     <p className="text-[var(--text-secondary)] mt-1">View rankings and edit department points</p>
    </div>
    <button onClick={() => fetchLeaderboard(false)} disabled={refreshing}
     className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all disabled:opacity-50"
     title="Refresh">
     <RefreshCw className={`w-5 h-5 text-[var(--text-secondary)] ${refreshing ? 'animate-spin' : ''}`} />
    </button>
   </div>

   {/* Current Leaderboard */}
   <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
    <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
     <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3">
      <TrendingUp className="w-6 h-6 text-[var(--color-accent)]" />
      Current Rankings
     </h2>
     <p className="text-[var(--text-secondary)] text-sm mt-2">Total Departments: {leaderboard.length} • Click a row to see points history • Click edit to modify points</p>
    </div>

    {leaderboard.length === 0 ? (
     <div className="p-12 text-center">
      <div className="text-5xl mb-4">📊</div>
      <p className="text-[var(--text-secondary)] text-lg">No departments on leaderboard yet</p>
      <p className="text-[var(--text-muted)] text-sm mt-2">Award points to departments to see them appear here</p>
     </div>
    ) : (
     <div className="divide-y divide-[var(--border-color)]">
      {(() => { const ranks = computeRanks(leaderboard); return leaderboard.map((dept, idx) => {
       const rank = ranks[idx];
       const history = dept.history || [];
       const isExpanded = expandedRow === dept._id;
       const isEditing = editingDept === dept._id;

       return (
        <React.Fragment key={dept._id}>
         <div
          onClick={() => !isEditing && history.length > 0 && toggleRow(dept._id)}
          className={`p-3 sm:p-4 md:p-6 transition-colors ${!isEditing && history.length > 0 ? 'cursor-pointer' : ''} hover:bg-[var(--bg-primary)]`}
         >
          <div className="flex items-center justify-between gap-3 sm:gap-4">
           {/* Rank and Name */}
           <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className={`${rank <= 3 ? 'bg-[var(--color-accent)]' : 'bg-[var(--bg-tertiary)]'} rounded-full w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-base sm:text-xl text-[var(--bg-primary)] flex-shrink-0`}>
             {getRankBadge(rank)}
            </div>
            <div className="min-w-0">
             <div className="text-[10px] sm:text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Position {rank}</div>
             <div className="text-sm sm:text-xl font-bold text-[var(--text-primary)] truncate">{dept.name}</div>
             <div className="text-xs sm:text-sm text-[var(--text-secondary)]">({dept.shortCode})</div>
            </div>
           </div>

           {/* Points Display or Edit Input */}
           <div className="text-right flex-shrink-0">
            {isEditing ? (
             <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
               type="number"
               min="0"
               value={editPoints}
               onChange={(e) => setEditPoints(e.target.value)}
               className="w-24 sm:w-32 px-3 py-2 text-lg font-bold text-[var(--color-accent)] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
               autoFocus
               onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePoints(dept._id);
                if (e.key === 'Escape') cancelEditing();
               }}
              />
              <button
               onClick={() => handleSavePoints(dept._id)}
               disabled={saving}
               className="p-2 rounded-lg bg-[rgba(74,222,128,0.1)] hover:bg-[rgba(74,222,128,0.15)] text-[#4ade80] transition-all disabled:opacity-50"
               title="Save"
              >
               {saving ? (
                <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin inline-block" />
               ) : (
                <Check className="w-5 h-5" />
               )}
              </button>
              <button
               onClick={cancelEditing}
               className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-all"
               title="Cancel"
              >
               <X className="w-5 h-5" />
              </button>
             </div>
            ) : (
             <>
              <div className="hidden sm:block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Total Points</div>
              <div className="text-2xl sm:text-4xl font-bold text-[var(--color-accent)] tabular-nums">{dept.points}</div>
              <div className="sm:hidden text-[10px] text-[var(--text-muted)]">pts</div>
             </>
            )}
           </div>

           {/* Expand indicator + Edit button */}
           {!isEditing && (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
             {history.length > 0 && (
              <ChevronDown className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
             )}
             <button onClick={(e) => { e.stopPropagation(); startEditing(dept); }}
              className="px-3 py-2 bg-[var(--color-accent-subtle)] hover:bg-[var(--color-accent-subtle)] text-[var(--color-accent)] rounded-lg font-medium text-sm transition-all flex items-center gap-1.5"
              title="Edit points"
             >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
             </button>
            </div>
           )}
          </div>
         </div>

         {/* Expanded Points History */}
         {isExpanded && history.length > 0 && (
          <div className="px-3 sm:px-6 pb-4 sm:pb-6 bg-[var(--bg-primary)]">
           <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-3">
             Points History
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
             {history
              .sort((a, b) => new Date(b.createdAt || b.awardedAt) - new Date(a.createdAt || a.awardedAt))
              .slice(0, 15)
              .map((log, logIdx) => (
               <div key={logIdx} className="flex justify-between items-center p-2 rounded-lg bg-[var(--bg-primary)]">
                <div>
                 <div className="text-sm font-medium text-[var(--text-primary)]">{log.eventName}</div>
                 <div className="text-xs text-[var(--text-secondary)]">{log.category}</div>
                </div>
                <div className="text-right">
                 <div className={`text-sm font-semibold ${log.points > 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                  {log.points > 0 ? '+' : ''}{log.points}
                 </div>
                 <div className="text-xs text-[var(--text-muted)]">
                  {new Date(log.awardedAt || log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                 </div>
                </div>
               </div>
              ))}
            </div>
           </div>
          </div>
         )}
        </React.Fragment>
       );
      }); })()}
     </div>
    )}
   </div>
  </div>
 );
};

export default LeaderboardManagement;
