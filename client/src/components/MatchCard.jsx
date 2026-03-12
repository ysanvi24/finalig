import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Crown } from 'lucide-react';
import SportBadge, { getSportAccent } from './SportBadge';
import { STATUS_CONFIG, formatMatchDate } from '../lib/constants';
import { useTheme } from '../context/ThemeContext';

const MatchCard = ({ match }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    if (!match) return null; // Defensive guard — prevent blank screen if null match slips through
    const isCompleted = match.status === 'COMPLETED';
    const accent = getSportAccent(match.sport);
    const statusConfig = STATUS_CONFIG[match.status] || {};

    const getTeamName = (team) => team?.shortCode || team?.name || 'TBD';

    const isWinner = (team) => {
        if (!match.winner || !team) return false;
        const winnerId = match.winner._id || match.winner;
        return winnerId === team._id;
    };

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: `0 12px 40px ${accent}15` }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/matches/${match._id}`)}
            className="relative rounded-2xl cursor-pointer transition-all overflow-hidden group"
            style={{
                backgroundColor: theme.bgSecondary,
                border: `1px solid ${theme.borderDefault}`,
            }}>

            {/* Sport accent line */}
            <div className="absolute inset-x-0 top-0 h-0.5 opacity-80" style={{ background: accent }} />

            <div className="p-4">
                {/* Header: Sport Badge + Status */}
                <div className="flex items-center justify-between mb-3">
                    <SportBadge sport={match.sport} size="sm" showLabel />
                    <div className="flex items-center gap-1.5">
                        {match.matchCategory && match.matchCategory !== 'REGULAR' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                style={{ backgroundColor: theme.accentSubtle, color: theme.accent }}>
                                {match.matchCategory.replace('_', ' ')}
                            </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusConfig.color || ''}`}
                            style={!statusConfig.color ? {
                                backgroundColor: theme.bgTertiary,
                                color: theme.textSecondary,
                                borderColor: theme.borderDefault,
                            } : undefined}>
                            {statusConfig.label || match.status}
                        </span>
                    </div>
                </div>

                {/* Teams & Scores */}
                <div className="flex items-center py-2.5">
                    {/* Team A */}
                    <div className="flex-1 text-center min-w-0">
                        <div className={`text-lg sm:text-xl font-bold truncate transition-colors ${
                            isWinner(match.teamA) ? 'text-emerald-400' : ''
                        }`} style={!isWinner(match.teamA) ? { color: theme.textPrimary } : undefined}>
                            {getTeamName(match.teamA)}
                        </div>
                        {isCompleted && match.scoreA && (
                            <div className="text-base font-bold mt-0.5 tabular-nums" style={{ color: theme.accent }}>{match.scoreA}</div>
                        )}
                        {isWinner(match.teamA) && (
                            <div className="flex items-center justify-center gap-0.5 mt-1">
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Winner</span>
                            </div>
                        )}
                    </div>

                    {/* VS divider */}
                    <div className="px-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: theme.bgPrimary,
                                boxShadow: `inset 0 0 0 1px ${theme.borderStrong}`,
                            }}>
                            <span className="text-[10px] font-bold" style={{ color: theme.textMuted }}>VS</span>
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="flex-1 text-center min-w-0">
                        <div className={`text-lg sm:text-xl font-bold truncate transition-colors ${
                            isWinner(match.teamB) ? 'text-emerald-400' : ''
                        }`} style={!isWinner(match.teamB) ? { color: theme.textPrimary } : undefined}>
                            {getTeamName(match.teamB)}
                        </div>
                        {isCompleted && match.scoreB && (
                            <div className="text-base font-bold mt-0.5 tabular-nums" style={{ color: theme.accent }}>{match.scoreB}</div>
                        )}
                        {isWinner(match.teamB) && (
                            <div className="flex items-center justify-center gap-0.5 mt-1">
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Winner</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                {match.summary && (
                    <div className="text-xs text-center mt-1 italic line-clamp-2" style={{ color: theme.textSecondary }}>{match.summary}</div>
                )}

                {/* Footer: Venue + Date */}
                <div className="flex items-center justify-center gap-3 mt-3 pt-2.5 text-[11px]"
                    style={{ borderTop: `1px solid ${theme.borderDefault}`, color: theme.textSecondary }}>
                    {match.venue && (
                        <span className="flex items-center gap-1 truncate max-w-[55%]">
                            <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: theme.textMuted }} />{match.venue}
                        </span>
                    )}
                    {match.scheduledAt && (
                        <span className="flex items-center gap-1 flex-shrink-0">
                            <Calendar className="w-3 h-3" style={{ color: theme.textMuted }} />
                            {formatMatchDate(match.scheduledAt)}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MatchCard;
