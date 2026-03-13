import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import socket from '../../socket';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, MapPin, Calendar, Clock, Tag } from 'lucide-react';
import SportBadge, { getSportAccent } from '../../components/SportBadge';
import { useTheme } from '../../context/ThemeContext';

const MatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMatch = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/matches/${id}`);
            setMatch(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Match not found');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchMatch();
        const handleMatchUpdate = (data) => {
            if (!data) return;
            if (data._id === id || data.matchId === id) fetchMatch();
        };
        socket.on('matchUpdate', handleMatchUpdate);
        return () => { socket.off('matchUpdate', handleMatchUpdate); };
    }, [id]);

    const getTeamName = (team) => team?.name || team?.shortCode || 'TBD';
    const getTeamShort = (team) => team?.shortCode || team?.name || 'TBD';

    const isWinner = (team) => {
        if (!match?.winner || !team) return false;
        const winnerId = match.winner._id || match.winner;
        return winnerId === team._id;
    };

    if (loading) return (
        <div className="min-h-screen shashwatam-bg" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />
            <div className="flex items-center justify-center pt-32">
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: theme.borderDefault, borderTopColor: theme.accent }} />
            </div>
        </div>
    );

    if (error || !match) return (
        <div className="min-h-screen shashwatam-bg" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />
            <div className="flex flex-col items-center justify-center pt-32">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: theme.bgTertiary }}>
                    <Trophy className="w-7 h-7" style={{ color: theme.textMuted }} />
                </div>
                <p style={{ color: theme.textMuted }}>{error || 'Match not found'}</p>
                <button onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}>
                    Go Home
                </button>
            </div>
        </div>
    );

    const isCompleted = match.status === 'COMPLETED';

    return (
        <div className="min-h-screen shashwatam-bg" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />

            <div className="max-w-2xl mx-auto px-4 pt-20 pb-12">
                {/* Back Button */}
                <button onClick={() => {
                        if (window.history.length > 1) navigate(-1);
                        else navigate('/');
                    }}
                    className="flex items-center gap-1.5 text-sm mb-6 transition-colors hover:opacity-80"
                    style={{ color: theme.textMuted }}>
                    <ArrowLeft className="w-4 h-4" /> Back to matches
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{
                        backgroundColor: theme.bgSecondary,
                        border: `1px solid ${theme.borderDefault}`,
                    }}>

                    {/* Header — sport-colored */}
                    <div className="p-5 text-white text-center"
                         style={{ background: `linear-gradient(135deg, ${getSportAccent(match.sport)}, ${getSportAccent(match.sport)}cc)` }}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <SportBadge sport={match.sport} size="md" />
                            <span className="text-sm font-medium opacity-90">{match.sport?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isCompleted ? 'bg-green-400/20 text-green-100' :
                                match.status === 'CANCELLED' ? 'bg-red-400/20 text-red-100' :
                                'bg-amber-400/20 text-amber-100'
                            }`}>
                                {match.status}
                            </span>
                            {match.matchCategory && match.matchCategory !== 'REGULAR' && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[rgba(255,255,255,0.1)]">
                                    {match.matchCategory.replace('_', ' ')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="p-6">
                        <div className="flex items-center justify-between py-6">
                            {/* Team A */}
                            <div className="flex-1 text-center">
                                <div className={`text-2xl sm:text-3xl font-bold mb-1 truncate ${isWinner(match.teamA) ? 'text-emerald-400' : ''}`}
                                    style={!isWinner(match.teamA) ? { color: theme.textPrimary } : undefined}>
                                    {getTeamShort(match.teamA)}
                                </div>
                                <div className="text-xs mb-2 truncate" style={{ color: theme.textMuted }}>{/*getTeamName(match.teamA)*/}</div>
                                {isCompleted && match.scoreA && (
                                    <div className="text-2xl font-bold" style={{ color: theme.accent }}>{match.scoreA}</div>
                                )}
                                {isWinner(match.teamA) && (
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <Trophy className="w-4 h-4" style={{ color: theme.accentHover }} />
                                        <span className="text-xs font-bold" style={{ color: theme.accent }}>WINNER</span>
                                    </div>
                                )}
                            </div>

                            <div className="px-4 sm:px-6">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: theme.bgTertiary }}>
                                    <span className="text-sm font-bold" style={{ color: theme.textMuted }}>VS</span>
                                </div>
                            </div>

                            {/* Team B */}
                            <div className="flex-1 text-center">
                                <div className={`text-2xl sm:text-3xl font-bold mb-1 truncate ${isWinner(match.teamB) ? 'text-emerald-400' : ''}`}
                                    style={!isWinner(match.teamB) ? { color: theme.textPrimary } : undefined}>
                                    {getTeamShort(match.teamB)}
                                </div>
                                <div className="text-xs mb-2 truncate" style={{ color: theme.textMuted }}>{/*getTeamName(match.teamB)*/}</div>
                                {isCompleted && match.scoreB && (
                                    <div className="text-2xl font-bold" style={{ color: theme.accent }}>{match.scoreB}</div>
                                )}
                                {isWinner(match.teamB) && (
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <Trophy className="w-4 h-4" style={{ color: theme.accentHover }} />
                                        <span className="text-xs font-bold" style={{ color: theme.accent }}>WINNER</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        {match.summary && (
                            <div className="text-center py-3 px-4 rounded-xl mb-4" style={{ backgroundColor: theme.bgPrimary }}>
                                <p className="text-sm italic" style={{ color: theme.textSecondary }}>{match.summary}</p>
                            </div>
                        )}

                        {/* Match Details */}
                        <div className="pt-4 space-y-2.5" style={{ borderTop: `1px solid ${theme.borderDefault}` }}>
                            {match.venue && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                    <MapPin className="w-4 h-4" style={{ color: theme.textMuted }} />
                                    <span>{match.venue}</span>
                                </div>
                            )}
                            {match.scheduledAt && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                    <Calendar className="w-4 h-4" style={{ color: theme.textMuted }} />
                                    <span>{new Date(match.scheduledAt).toLocaleDateString('en-IN', {
                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                    })}</span>
                                </div>
                            )}
                            {match.scheduledAt && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                    <Clock className="w-4 h-4" style={{ color: theme.textMuted }} />
                                    <span>{new Date(match.scheduledAt).toLocaleTimeString('en-IN', {
                                        hour: 'numeric', minute: '2-digit', hour12: true
                                    })}</span>
                                </div>
                            )}
                            {match.matchCategory && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                    <Tag className="w-4 h-4" style={{ color: theme.textMuted }} />
                                    <span>{match.matchCategory.replace('_', ' ')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default MatchDetail;
