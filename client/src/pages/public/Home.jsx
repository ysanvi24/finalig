import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import MatchCard from '../../components/MatchCard';
import SportBadge from '../../components/SportBadge';
import { MatchCardSkeleton, HighlightSkeleton } from '../../components/SkeletonLoader';
import { MATCH_SPORTS, getSportLabel } from '../../config/sportsRegistry';
const SPORTS = MATCH_SPORTS.map(s => s.id);
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, FileText, Trophy, Sparkles, RefreshCw, ExternalLink, ChevronLeft, ChevronRight, Award, X, Medal, CalendarDays, CheckCircle2, Dumbbell, Building2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Timezone-safe local date helper (avoids UTC offset issues with toISOString)
const getLocalDateStr = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const Home = () => {
    const { theme } = useTheme();
    const [matches, setMatches] = useState([]);
    const [highlights, setHighlights] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSport, setSelectedSport] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedDept, setSelectedDept] = useState('ALL');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [highlightDate, setHighlightDate] = useState(getLocalDateStr());
    const [availableDates, setAvailableDates] = useState([]);
    const [showArticle, setShowArticle] = useState(false);
    const debounceRef = useRef(null);

    const todayStr = getLocalDateStr();

    const fetchHighlightsForDate = useCallback(async (date) => {
        try {
            const res = await api.get(`/highlights?date=${date}`);
            const data = res.data.data || res.data || [];
            const reel = data.find(h => h.type === 'reel') || null;
            const pic = data.find(h => h.type === 'pic') || null;
            const article = data.find(h => h.type === 'article') || null;
            setHighlights({ reelOfTheDay: reel, picOfTheDay: pic, articleOfTheDay: article });
        } catch {
            setHighlights({});
        }
    }, []);

    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const [matchRes] = await Promise.all([
                api.get('/matches'),
                fetchHighlightsForDate(highlightDate)
            ]);

            // Fetch available highlight dates
            api.get('/highlights/dates').then(res => {
                setAvailableDates(res.data || []);
            }).catch(() => {});

            const matchData = matchRes.data.data || [];
            matchData.sort((a, b) => {
                const priority = { SCHEDULED: 0, COMPLETED: 1, CANCELLED: 2 };
                if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
                return new Date(b.scheduledAt || 0) - new Date(a.scheduledAt || 0);
            });

            setMatches(matchData);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [highlightDate, fetchHighlightsForDate]);

    // ── Sort helper (keeps UI stable) ──
    const sortMatches = useCallback((list) => {
        const priority = { SCHEDULED: 0, COMPLETED: 1, CANCELLED: 2 };
        return [...list].sort((a, b) => {
            if (priority[a.status] !== priority[b.status]) return priority[a.status] - priority[b.status];
            return new Date(b.scheduledAt || 0) - new Date(a.scheduledAt || 0);
        });
    }, []);

    useEffect(() => {
        fetchData();

        const handleMatchCreated = (match) => {
            if (!match?._id) return;
            setMatches(prev => {
                if (prev.some(m => m._id === match._id)) return prev;
                return sortMatches([match, ...prev]);
            });
            setLastUpdated(new Date());
        };

        const handleMatchUpdate = (match) => {
            if (!match?._id) return;
            setMatches(prev => {
                const idx = prev.findIndex(m => m._id === match._id);
                if (idx === -1) return sortMatches([match, ...prev]);
                const updated = [...prev];
                updated[idx] = { ...updated[idx], ...match };
                return sortMatches(updated);
            });
            setLastUpdated(new Date());
        };

        const handleMatchDeleted = (data) => {
            const matchId = data?.matchId || data?._id;
            if (!matchId) return;
            setMatches(prev => prev.filter(m => m._id !== matchId));
            setLastUpdated(new Date());
        };

        const debouncedHighlightFetch = () => {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => fetchHighlightsForDate(highlightDate), 600);
        };

        socket.on('matchCreated', handleMatchCreated);
        socket.on('matchUpdate', handleMatchUpdate);
        socket.on('matchDeleted', handleMatchDeleted);
        socket.on('highlightCreated', debouncedHighlightFetch);
        socket.on('highlightUpdated', debouncedHighlightFetch);
        socket.on('highlightDeleted', debouncedHighlightFetch);

        const handleReconnect = () => {
            console.log('🔄 Socket reconnected — syncing missed events');
            fetchData(true);
        };
        socket.io.on('reconnect', handleReconnect);

        return () => {
            clearTimeout(debounceRef.current);
            socket.off('matchCreated', handleMatchCreated);
            socket.off('matchUpdate', handleMatchUpdate);
            socket.off('matchDeleted', handleMatchDeleted);
            socket.off('highlightCreated', debouncedHighlightFetch);
            socket.off('highlightUpdated', debouncedHighlightFetch);
            socket.off('highlightDeleted', debouncedHighlightFetch);
            socket.io.off('reconnect', handleReconnect);
        };
    }, [fetchData, sortMatches, highlightDate, fetchHighlightsForDate]);

    useEffect(() => {
        fetchHighlightsForDate(highlightDate);
    }, [highlightDate, fetchHighlightsForDate]);

    const shiftDate = (days) => {
        const d = new Date(highlightDate + 'T12:00:00');
        d.setDate(d.getDate() + days);
        const newDate = getLocalDateStr(d);
        if (newDate <= todayStr) {
            setHighlightDate(newDate);
        }
    };

    const formatDisplayDate = (dateStr) => {
        if (dateStr === todayStr) return 'Today';
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dateStr === getLocalDateStr(yesterday)) return 'Yesterday';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const filteredMatches = useMemo(() => {
        return matches.filter(m => {
            if (selectedSport !== 'ALL' && m.sport !== selectedSport) return false;
            if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;
            if (selectedDept !== 'ALL') {
                const teamACode = m.teamA?.shortCode || m.teamA?.name || '';
                const teamBCode = m.teamB?.shortCode || m.teamB?.name || '';
                const teamAId = m.teamA?._id || m.teamA;
                const teamBId = m.teamB?._id || m.teamB;
                if (teamACode !== selectedDept && teamBCode !== selectedDept &&
                    teamAId !== selectedDept && teamBId !== selectedDept) return false;
            }
            return true;
        });
    }, [matches, selectedSport, selectedStatus, selectedDept]);

    const matchDepts = useMemo(() => {
        const deptMap = new Map();
        matches.forEach(m => {
            [m.teamA, m.teamB].forEach(team => {
                if (team && typeof team === 'object' && team.shortCode) {
                    deptMap.set(team.shortCode, team.shortCode);
                }
            });
        });
        return Array.from(deptMap.values()).sort();
    }, [matches]);

    const stats = useMemo(() => ({
        total: matches.length,
        scheduled: matches.filter(m => m.status === 'SCHEDULED').length,
        completed: matches.filter(m => m.status === 'COMPLETED').length,
        sports: [...new Set(matches.map(m => m.sport))].length
    }), [matches]);

    const reelOfDay = highlights.reelOfTheDay || null;
    const picOfDay = highlights.picOfTheDay || null;
    const articleOfDay = highlights.articleOfTheDay || null;

    // Helper: highlight card style
    const hlCard = {
        backgroundColor: theme.bgSecondary,
        border: `1px solid ${theme.borderDefault}`,
    };
    const hlEmpty = {
        border: `2px dashed ${theme.borderDefault}`,
        backgroundColor: theme.accentSubtle,
    };

    return (
        <div className="min-h-screen shashwatam-bg" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
                        style={{ backgroundColor: theme.accentSubtle, color: theme.accent }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
                        Season 2025-26
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{ color: theme.textPrimary }}>
                        Institute Gathering
                        <br className="sm:hidden" />
                        {' '}
                    </h1>
                    <p className="text-sm max-w-md mx-auto" style={{ color: theme.textMuted }}>
                        Follow all the action from the inter-department championship
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-8">
                    {[
                        { label: 'Matches', value: stats.total, icon: <Medal className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: theme.accent }} />, color: 'from-amber-400 to-amber-600' },
                        { label: 'Upcoming', value: stats.scheduled, icon: <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />, color: 'from-amber-300 to-amber-500' },
                        { label: 'Results', value: stats.completed, icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />, color: 'from-emerald-400 to-emerald-600' },
                        { label: 'Sports', value: stats.sports, icon: <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />, color: 'from-purple-400 to-purple-600' }
                    ].map((stat, i) => (
                        <motion.div key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="relative overflow-hidden rounded-xl p-3 sm:p-4 text-center"
                            style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.color}`} />
                            <div className="flex justify-center mb-1">{stat.icon}</div>
                            <div className="text-xl sm:text-2xl font-bold" style={{ color: theme.textPrimary }}>{loading ? '-' : stat.value}</div>
                            <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide" style={{ color: theme.textMuted }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ========== TODAY'S HIGHLIGHTS ========== */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: theme.accentSubtle }}>
                                <Sparkles className="w-4 h-4" style={{ color: theme.accent }} />
                            </div>
                            Highlights
                        </h2>
                        {lastUpdated && (
                            <button onClick={() => fetchData(true)}
                                disabled={refreshing}
                                className="flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50"
                                style={{ color: theme.textMuted }}>
                                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Updating...' : 'Refresh'}
                            </button>
                        )}
                    </div>

                    {/* Date Selector */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5">
                        <button
                            onClick={() => shiftDate(-1)}
                            className="p-2 rounded-lg transition-colors flex-shrink-0"
                            style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}`, color: theme.textMuted }}
                            aria-label="Previous day">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 min-w-0">
                            <input
                                type="date"
                                value={highlightDate}
                                max={todayStr}
                                onChange={(e) => setHighlightDate(e.target.value)}
                                className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm outline-none cursor-pointer max-w-[150px] sm:max-w-none"
                                style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}`, color: theme.textSecondary }}
                            />
                            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap" style={{ color: theme.textSecondary }}>
                                {formatDisplayDate(highlightDate)}
                            </span>
                        </div>
                        <button
                            onClick={() => shiftDate(1)}
                            disabled={highlightDate >= todayStr}
                            className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                            style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}`, color: theme.textMuted }}
                            aria-label="Next day">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        {highlightDate !== todayStr && (
                            <button
                                onClick={() => setHighlightDate(todayStr)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                                style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}>
                                Today
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* --- REEL OF THE DAY --- */}
                        {loading ? <HighlightSkeleton /> : reelOfDay ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-shadow"
                                style={hlCard}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: theme.accentSubtle }}>
                                        <Film className="w-4 h-4" style={{ color: theme.accent }} />
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: theme.accent }}>Reel of the Day</span>
                                    {reelOfDay.department && (
                                        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                                            style={{ backgroundColor: theme.accentSubtle, color: theme.accent }}>
                                            <Award className="w-2.5 h-2.5" />
                                            {(reelOfDay.department && typeof reelOfDay.department === 'object') ? (reelOfDay.department.shortCode || reelOfDay.department.name) : reelOfDay.department}
                                        </span>
                                    )}
                                </div>
                                {reelOfDay.caption && (
                                    <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.textSecondary }}>{reelOfDay.caption}</p>
                                )}
                                {reelOfDay.instagramUrl && (
                                    <a href={reelOfDay.instagramUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                                        style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}>
                                        <Film className="w-3.5 h-3.5" /> Watch on Instagram
                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                                    </a>
                                )}
                            </motion.div>
                        ) : (
                            <div className="rounded-2xl p-6 sm:p-8 text-center" style={hlEmpty}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                    style={{ backgroundColor: theme.accentSubtle }}>
                                    <Film className="w-7 h-7" style={{ color: theme.textMuted }} />
                                </div>
                                <h3 className="font-semibold mb-1" style={{ color: theme.textSecondary }}>Reel of the Day</h3>
                                <p className="text-sm" style={{ color: theme.textMuted }}>No reel posted today yet</p>
                                <p className="text-xs mt-1.5" style={{ color: theme.textMuted }}>Check back for match highlights! 🎬</p>
                            </div>
                        )}

                        {/* --- PIC OF THE DAY --- */}
                        {loading ? <HighlightSkeleton /> : picOfDay ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-shadow overflow-hidden"
                                style={hlCard}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: theme.accentSubtle }}>
                                        <Camera className="w-4 h-4" style={{ color: theme.accent }} />
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: theme.accent }}>Pic of the Day</span>
                                    {picOfDay.department && (
                                        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                                            style={{ backgroundColor: theme.accentSubtle, color: theme.accent }}>
                                            <Award className="w-2.5 h-2.5" />
                                            {(picOfDay.department && typeof picOfDay.department === 'object') ? (picOfDay.department.shortCode || picOfDay.department.name) : picOfDay.department}
                                        </span>
                                    )}
                                </div>
                                {picOfDay.caption && (
                                    <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.textSecondary }}>{picOfDay.caption}</p>
                                )}
                                {picOfDay.instagramUrl && (
                                    <a href={picOfDay.instagramUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                                        style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}>
                                        <Camera className="w-3.5 h-3.5" /> View on Instagram
                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                                    </a>
                                )}
                            </motion.div>
                        ) : (
                            <div className="rounded-2xl p-6 sm:p-8 text-center" style={hlEmpty}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                    style={{ backgroundColor: theme.accentSubtle }}>
                                    <Camera className="w-7 h-7" style={{ color: theme.textMuted }} />
                                </div>
                                <h3 className="font-semibold mb-1" style={{ color: theme.textSecondary }}>Pic of the Day</h3>
                                <p className="text-sm" style={{ color: theme.textMuted }}>No photo posted today yet</p>
                                <p className="text-xs mt-1.5" style={{ color: theme.textMuted }}>Check back for stunning captures! 📸</p>
                            </div>
                        )}

                        {/* --- ARTICLE OF THE DAY --- */}
                        {loading ? <HighlightSkeleton /> : articleOfDay ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => articleOfDay.content && setShowArticle(true)}
                                className={`rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-shadow ${articleOfDay.content ? 'cursor-pointer' : ''}`}
                                style={hlCard}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: theme.accentSubtle }}>
                                        <FileText className="w-4 h-4" style={{ color: theme.accent }} />
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: theme.accent }}>Article of the Day</span>
                                    {articleOfDay.department && (
                                        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                                            style={{ backgroundColor: theme.accentSubtle, color: theme.accent }}>
                                            <Award className="w-2.5 h-2.5" />
                                            {typeof articleOfDay.department === 'object' ? (articleOfDay.department.shortCode || articleOfDay.department.name) : articleOfDay.department}
                                        </span>
                                    )}
                                </div>
                                {articleOfDay.caption && (
                                    <p className="text-xs font-medium mb-2" style={{ color: theme.accent }}>{articleOfDay.caption}</p>
                                )}
                                {articleOfDay.content ? (
                                    <>
                                        <p className="text-sm leading-relaxed whitespace-pre-line line-clamp-6" style={{ color: theme.textSecondary }}>{articleOfDay.content}</p>
                                        <p className="text-xs font-medium mt-3 flex items-center gap-1" style={{ color: theme.accent }}>
                                            <FileText className="w-3 h-3" /> Tap to read full article &rarr;
                                        </p>
                                    </>
                                ) : articleOfDay.instagramUrl ? (
                                    <a href={articleOfDay.instagramUrl} target="_blank" rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                                        style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}>
                                        <FileText className="w-3.5 h-3.5" /> Read on Instagram
                                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                                    </a>
                                ) : null}
                            </motion.div>
                        ) : (
                            <div className="rounded-2xl p-6 sm:p-8 text-center" style={hlEmpty}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                    style={{ backgroundColor: theme.accentSubtle }}>
                                    <FileText className="w-7 h-7" style={{ color: theme.textMuted }} />
                                </div>
                                <h3 className="font-semibold mb-1" style={{ color: theme.textSecondary }}>Article of the Day</h3>
                                <p className="text-sm" style={{ color: theme.textMuted }}>No article posted today yet</p>
                                <p className="text-xs mt-1.5" style={{ color: theme.textMuted }}>Check back for event coverage! 📝</p>
                            </div>
                        )}
                    </div>

                    {/* Full Article Overlay */}
                    <AnimatePresence>
                        {showArticle && articleOfDay?.content && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-12 sm:pt-20 overflow-y-auto"
                                onClick={() => setShowArticle(false)}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 30, scale: 0.97 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                                    style={{ backgroundColor: theme.bgSecondary }}>
                                    {/* Header */}
                                    <div className="flex items-center gap-2 p-5 flex-shrink-0"
                                        style={{ borderBottom: `1px solid ${theme.borderDefault}` }}>
                                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: theme.accentSubtle }}>
                                            <FileText className="w-4 h-4" style={{ color: theme.accent }} />
                                        </div>
                                        <span className="text-sm font-bold flex-1" style={{ color: theme.accent }}>Article of the Day</span>
                                        {articleOfDay.department && (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                                                style={{ backgroundColor: theme.accentSubtle, color: theme.accent }}>
                                                <Award className="w-2.5 h-2.5" />
                                                {(articleOfDay.department && typeof articleOfDay.department === 'object') ? (articleOfDay.department.shortCode || articleOfDay.department.name) : articleOfDay.department}
                                            </span>
                                        )}
                                        <button onClick={() => setShowArticle(false)}
                                            className="p-1.5 rounded-lg transition-colors" style={{ color: theme.textMuted }}>
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {/* Body */}
                                    <div className="p-5 sm:p-6 overflow-y-auto flex-1">
                                        {articleOfDay.caption && (
                                            <p className="text-sm font-semibold mb-3" style={{ color: theme.accent }}>{articleOfDay.caption}</p>
                                        )}
                                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: theme.textSecondary }}>{articleOfDay.content}</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>

                {/* ========== MATCHES SECTION ========== */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                            <div className="p-1.5 rounded-lg" style={{ backgroundColor: theme.accentSubtle }}>
                                <Trophy className="w-4 h-4" style={{ color: theme.accent }} />
                            </div>
                            Matches
                        </h2>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ color: theme.textMuted, backgroundColor: theme.bgTertiary }}>
                            {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
                        </span>
                    </div>

                    {/* Sport Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                        <button onClick={() => setSelectedSport('ALL')}
                            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                            style={selectedSport === 'ALL'
                                ? { backgroundColor: theme.accent, color: theme.bgPrimary, boxShadow: `0 2px 8px ${theme.accentSubtle}` }
                                : { backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.borderDefault}` }
                            }>
                            All Sports
                        </button>
                        {SPORTS.map(sport => (
                            <button key={sport} onClick={() => setSelectedSport(sport)}
                                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5"
                                style={selectedSport === sport
                                    ? { backgroundColor: theme.accent, color: theme.bgPrimary, boxShadow: `0 2px 8px ${theme.accentSubtle}` }
                                    : { backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.borderDefault}` }
                                }>
                                <SportBadge sport={sport} size="xs" /> {getSportLabel(sport)}
                            </button>
                        ))}
                    </div>

                    {/* Department Filter Pills */}
                    {matchDepts.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                            <button onClick={() => setSelectedDept('ALL')}
                                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5"
                                style={selectedDept === 'ALL'
                                    ? { backgroundColor: theme.accent, color: theme.bgPrimary, boxShadow: `0 2px 8px ${theme.accentSubtle}` }
                                    : { backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.borderDefault}` }
                                }>
                                <Building2 className="w-3 h-3" /> All Depts
                            </button>
                            {matchDepts.map(dept => (
                                <button key={dept} onClick={() => setSelectedDept(dept)}
                                    className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
                                    style={selectedDept === dept
                                        ? { backgroundColor: theme.accent, color: theme.bgPrimary, boxShadow: `0 2px 8px ${theme.accentSubtle}` }
                                        : { backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.borderDefault}` }
                                    }>
                                    {dept}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Status Tabs */}
                    <div className="flex gap-1 rounded-xl p-1 mb-6" style={{ backgroundColor: theme.bgTertiary }}>
                        {[
                            { key: 'ALL', label: 'All' },
                            { key: 'SCHEDULED', label: 'Upcoming' },
                            { key: 'COMPLETED', label: 'Completed' },
                            { key: 'CANCELLED', label: 'Cancelled' }
                        ].map(tab => (
                            <button key={tab.key} onClick={() => setSelectedStatus(tab.key)}
                                className="flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                style={selectedStatus === tab.key
                                    ? { backgroundColor: theme.bgSecondary, color: theme.textPrimary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                                    : { color: theme.textMuted }
                                }>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Match Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <MatchCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredMatches.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 sm:py-20">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: theme.bgTertiary }}>
                                <Trophy className="w-8 h-8" style={{ color: theme.textMuted }} />
                            </div>
                            <h3 className="font-semibold mb-1" style={{ color: theme.textSecondary }}>No matches found</h3>
                            <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Try adjusting your filters</p>
                            {(selectedSport !== 'ALL' || selectedStatus !== 'ALL' || selectedDept !== 'ALL') && (
                                <button onClick={() => { setSelectedSport('ALL'); setSelectedStatus('ALL'); setSelectedDept('ALL'); }}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition-colors active:scale-95"
                                    style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}>
                                    Clear Filters
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredMatches.map((match, i) => (
                                    <motion.div key={match._id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                                        <MatchCard match={match} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </section>

                {/* Footer */}
                {lastUpdated && !loading && (
                    <div className="text-center mt-10 text-xs" style={{ color: theme.textMuted }}>
                        Last updated {lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        {' · '}Real-time updates enabled
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Home;
