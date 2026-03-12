import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import { toast } from 'react-hot-toast';
import { RefreshCw, Trophy, TrendingUp, ChevronDown, Pencil, Check, X } from 'lucide-react';

const LeaderboardManagement = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [editingDept, setEditingDept] = useState(null);
    const [editPoints, setEditPoints] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
        const handlePointsAwarded = () => fetchLeaderboard();
        const handleReset = () => fetchLeaderboard();
        socket.on('pointsAwarded', handlePointsAwarded);
        socket.on('leaderboardReset', handleReset);
        return () => { socket.off('pointsAwarded', handlePointsAwarded); socket.off('leaderboardReset', handleReset); };
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leaderboard');
            const sorted = (response.data.data || []).sort((a, b) => b.points - a.points);
            setLeaderboard(sorted);
        } catch (err) { toast.error('Failed to load leaderboard'); }
        finally { setLoading(false); }
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
            await fetchLeaderboard();
            toast.success('Points updated successfully!');
            cancelEditing();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update points'); }
        finally { setSaving(false); }
    };

    const getRankBadge = (rank) => ['🥇', '🥈', '🥉'][rank - 1] || `#${rank}`;

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-3 sm:p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-blue-500" />
                        Leaderboard Management
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">View rankings and edit department points</p>
                </div>
                <button onClick={fetchLeaderboard} disabled={loading}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                    title="Refresh">
                    <RefreshCw className={`w-5 h-5 text-slate-500 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Current Leaderboard */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                        Current Rankings
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Total Departments: {leaderboard.length} • Click a row to see points history • Click edit to modify points</p>
                </div>

                {leaderboard.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-5xl mb-4">📊</div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">No departments on leaderboard yet</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Award points to departments to see them appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {leaderboard.map((dept, idx) => {
                            const history = dept.history || [];
                            const isExpanded = expandedRow === dept._id;
                            const isEditing = editingDept === dept._id;

                            return (
                                <React.Fragment key={dept._id}>
                                    <div
                                        onClick={() => !isEditing && history.length > 0 && toggleRow(dept._id)}
                                        className={`p-3 sm:p-4 md:p-6 transition-colors ${!isEditing && history.length > 0 ? 'cursor-pointer' : ''} hover:bg-slate-50 dark:hover:bg-slate-900`}
                                    >
                                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                                            {/* Rank and Name */}
                                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                                <div className={`${idx < 3 ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-600'} rounded-full w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-base sm:text-xl text-white flex-shrink-0`}>
                                                    {getRankBadge(idx + 1)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Position {idx + 1}</div>
                                                    <div className="text-sm sm:text-xl font-bold text-slate-800 dark:text-white truncate">{dept.name}</div>
                                                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">({dept.shortCode})</div>
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
                                                            className="w-24 sm:w-32 px-3 py-2 text-lg font-bold text-blue-500 bg-slate-50 dark:bg-slate-700 border border-blue-300 dark:border-blue-600 rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSavePoints(dept._id);
                                                                if (e.key === 'Escape') cancelEditing();
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => handleSavePoints(dept._id)}
                                                            disabled={saving}
                                                            className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 transition-all disabled:opacity-50"
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
                                                            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-all"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="hidden sm:block text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Points</div>
                                                        <div className="text-2xl sm:text-4xl font-bold text-blue-500 tabular-nums">{dept.points}</div>
                                                        <div className="sm:hidden text-[10px] text-slate-400">pts</div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Expand indicator + Edit button */}
                                            {!isEditing && (
                                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                                    {history.length > 0 && (
                                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    )}
                                                    <button onClick={(e) => { e.stopPropagation(); startEditing(dept); }}
                                                        className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg font-medium text-sm transition-all flex items-center gap-1.5"
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
                                        <div className="px-3 sm:px-6 pb-4 sm:pb-6 bg-slate-50 dark:bg-slate-900/50">
                                            <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                                                    Points History
                                                </h4>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {history
                                                        .sort((a, b) => new Date(b.createdAt || b.awardedAt) - new Date(a.createdAt || a.awardedAt))
                                                        .slice(0, 15)
                                                        .map((log, logIdx) => (
                                                            <div key={logIdx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                                                <div>
                                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{log.eventName}</div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{log.category}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`text-sm font-semibold ${log.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                        {log.points > 0 ? '+' : ''}{log.points}
                                                                    </div>
                                                                    <div className="text-xs text-slate-400">
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
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardManagement;
