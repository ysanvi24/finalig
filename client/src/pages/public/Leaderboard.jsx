import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/axios';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import { Trophy, Search, X, Medal } from 'lucide-react';
import socket from '../../socket';
import { useTheme } from '../../context/ThemeContext';

/** Safe image-with-fallback — avoids innerHTML / direct DOM mutation */
const LogoWithFallback = ({ src, alt, fallbackText, accentColor }) => {
    const [failed, setFailed] = React.useState(false);
    if (failed || !src) {
        return (
            <span style={{ fontSize: 12, fontWeight: 800, color: accentColor }}>
                {fallbackText || '?'}
            </span>
        );
    }
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain"
            onError={() => setFailed(true)}
        />
    );
};

const Leaderboard = () => {
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef(null);
    const { theme } = useTheme();

    const fetchStandings = useCallback(async () => {
        try {
            const res = await api.get('/leaderboard');
            const data = res.data.data || res.data;
            setStandings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching standings:', error);
            setStandings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStandings();

        socket.on('pointsAwarded', fetchStandings);
        socket.on('leaderboardReset', fetchStandings);

        const debouncedFetch = () => {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(fetchStandings, 3000);
        };
        socket.on('matchUpdate', debouncedFetch);

        return () => {
            clearTimeout(debounceRef.current);
            socket.off('pointsAwarded', fetchStandings);
            socket.off('leaderboardReset', fetchStandings);
            socket.off('matchUpdate', debouncedFetch);
        };
    }, [fetchStandings]);

    // Compute ranks with ties (same points = same rank)
    const computeRanks = (list) => {
        const ranks = [];
        let currentRank = 1;
        for (let i = 0; i < list.length; i++) {
            const pts = list[i].points ?? 0;
            if (i > 0) {
                const prevPts = list[i - 1].points ?? 0;
                if (pts < prevPts) currentRank = i + 1;
            }
            ranks.push(currentRank);
        }
        return ranks;
    };

    // Sort standings by points descending
    const sortedStandings = [...standings].sort((a, b) => (b.points || 0) - (a.points || 0));

    // Filter by search
    const filteredStandings = sortedStandings.filter(team => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const name = (team.name || team.department?.name || '').toLowerCase();
        const code = (team.shortCode || team.department?.shortCode || '').toLowerCase();
        return name.includes(q) || code.includes(q);
    });

    const ranks = computeRanks(filteredStandings);

    const getRankDisplay = (rank) => {
        if (rank === 1) return (
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-xs sm:text-sm font-black text-white">1</span>
            </div>
        );
        if (rank === 2) return (
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center shadow-lg shadow-slate-400/20">
                <span className="text-xs sm:text-sm font-black text-white">2</span>
            </div>
        );
        if (rank === 3) return (
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-xs sm:text-sm font-black text-white">3</span>
            </div>
        );
        return (
            <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                style={{
                    backgroundColor: theme.bgTertiary,
                    border: `1px solid ${theme.borderDefault}`,
                }}
            >
                <span className="text-xs sm:text-sm font-bold" style={{ color: theme.textMuted }}>
                    {rank}
                </span>
            </div>
        );
    };

    const getLogoUrl = (logoPath) => {
        if (!logoPath || logoPath === '' || logoPath.includes('undefined')) return null;
        if (logoPath.startsWith('http')) return logoPath;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
        return `${baseUrl}${logoPath}`;
    };

    if (loading) return (
        <div className="min-h-screen shashwatam-bg" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div
                        className="w-10 h-10 rounded-full border-2 animate-spin mx-auto mb-4"
                        style={{ borderColor: theme.borderDefault, borderTopColor: theme.accent }}
                    />
                    <p className="text-sm" style={{ color: theme.textMuted }}>Loading standings...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen shashwatam-bg" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />

            {/* Header */}
            <div className="py-8 sm:py-10 px-4 text-center" style={{ borderBottom: `1px solid ${theme.borderDefault}` }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: theme.accentSubtle }}>
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: theme.accent }} />
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: theme.textPrimary }}>
                        Department Standings
                    </h1>
                </div>
                <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                    Inter-Department Championship
                </p>
            </div>

            <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
                {/* Search */}
                <div className="mb-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search department..."
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
                            style={{
                                backgroundColor: theme.bgSecondary,
                                border: `1px solid ${theme.borderDefault}`,
                                color: theme.textPrimary,
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: theme.textMuted }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{
                        backgroundColor: theme.bgSecondary,
                        border: `1px solid ${theme.borderDefault}`,
                    }}
                >
                    {/* Header Row */}
                    <div
                        className="hidden sm:flex items-center px-4 py-3 text-xs font-medium uppercase tracking-wide"
                        style={{
                            color: theme.textMuted,
                            borderBottom: `1px solid ${theme.borderDefault}`,
                            backgroundColor: theme.bgPrimary,
                        }}
                    >
                        <div className="w-14 text-center flex-shrink-0">Rank</div>
                        <div className="flex-1 ml-3">Department</div>
                        <div className="w-24 text-right pr-1 flex-shrink-0">Points</div>
                    </div>

                    {/* Standings */}
                    <div>
                        {filteredStandings.length === 0 ? (
                            <div className="text-center py-12">
                                <Search className="w-8 h-8 mx-auto mb-3" style={{ color: theme.textMuted }} />
                                <p className="text-sm" style={{ color: theme.textMuted }}>No departments match your search</p>
                            </div>
                        ) : (
                            filteredStandings.map((team, index) => {
                                const rank = ranks[index];
                                const isTop3 = rank <= 3;
                                const deptName = team.name || team.department?.name || 'Unknown';
                                const deptCode = team.shortCode || team.department?.shortCode || '';
                                const deptLogo = team.logo || team.department?.logo;
                                const points = team.points ?? 0;

                                return (
                                    <motion.div
                                        key={team._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="flex items-center px-3 sm:px-4 py-3 sm:py-4 gap-2 sm:gap-3 transition-colors"
                                        style={{
                                            backgroundColor: isTop3 ? theme.accentSubtle : 'transparent',
                                            borderBottom: `1px solid ${theme.borderDefault}`,
                                        }}
                                    >
                                        {/* Rank */}
                                        <div className="flex-shrink-0">
                                            {getRankDisplay(rank)}
                                        </div>

                                        {/* Logo */}
                                        <div className="flex-shrink-0">
                                            {getLogoUrl(deptLogo) ? (
                                                <div
                                                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center overflow-hidden"
                                                    style={{
                                                        backgroundColor: theme.bgTertiary,
                                                        border: `2px solid ${isTop3 ? theme.accent : theme.borderDefault}`,
                                                    }}
                                                >
                                                    <LogoWithFallback
                                                        src={getLogoUrl(deptLogo)}
                                                        alt={deptName}
                                                        fallbackText={deptCode?.slice(0, 3) || '?'}
                                                        accentColor={theme.accent}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: theme.accentSubtle,
                                                        border: `2px solid ${isTop3 ? theme.accent : theme.borderDefault}`,
                                                    }}
                                                >
                                                    <span className="text-xs sm:text-sm font-extrabold" style={{ color: theme.accent }}>
                                                        {deptCode?.slice(0, 3)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Department Name */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>
                                                {deptName}
                                            </div>
                                            {deptCode && (
                                                <div className="text-xs truncate" style={{ color: theme.textMuted }}>
                                                    {deptCode}
                                                </div>
                                            )}
                                        </div>

                                        {/* Points */}
                                        <div className="flex-shrink-0 text-right min-w-[52px]">
                                            <div
                                                className="text-lg sm:text-xl font-bold tabular-nums"
                                                style={{ color: isTop3 ? theme.accent : theme.textPrimary }}
                                            >
                                                {points}
                                            </div>
                                            <div className="text-[10px]" style={{ color: theme.textMuted }}>pts</div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs" style={{ color: theme.textMuted }}>
                    <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-md flex items-center justify-center">
                            <span className="text-[8px] font-black text-white">1</span>
                        </div>
                        1st Place
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-gradient-to-br from-slate-300 to-slate-400 rounded-md flex items-center justify-center">
                            <span className="text-[8px] font-black text-white">2</span>
                        </div>
                        2nd Place
                    </span>
                    <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md flex items-center justify-center">
                            <span className="text-[8px] font-black text-white">3</span>
                        </div>
                        3rd Place
                    </span>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Leaderboard;
