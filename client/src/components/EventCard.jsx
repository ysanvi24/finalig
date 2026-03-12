import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Trophy, Clock, Users, Medal } from 'lucide-react';
import EventBadge, { EventCategoryTag } from './EventBadge';
import { getEntry } from '../config/sportsRegistry';
import { useTheme } from '../context/ThemeContext';

const STATUS_STYLES = {
    UPCOMING:     { label: 'Upcoming',    dot: '#fbbf24', bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    IN_PROGRESS:  { label: 'Live',        dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', border: 'rgba(239,68,68,0.25)' },
    COMPLETED:    { label: 'Completed',   dot: '#4ade80', bg: 'rgba(74,222,128,0.12)', text: '#4ade80', border: 'rgba(74,222,128,0.25)' },
    CANCELLED:    { label: 'Cancelled',   dot: '#f87171', bg: 'rgba(248,113,113,0.12)', text: '#f87171', border: 'rgba(248,113,113,0.25)' },
};

const MEDALS = ['🥇', '🥈', '🥉'];

const EventCard = ({ event }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const entry = getEntry(event.sport);
    const statusStyle = STATUS_STYLES[event.status] || STATUS_STYLES.UPCOMING;

    const formatDate = (d) => {
        if (!d) return null;
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const topResults = (event.results || []).slice(0, 3);

    return (
        <motion.div
            whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate(`/events/${event._id}`)}
            className="rounded-xl p-4 cursor-pointer transition-all"
            style={{
                backgroundColor: theme.bgSecondary,
                border: `1px solid ${theme.borderDefault}`,
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <EventBadge category={event.category} size="sm" />
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate" style={{ color: theme.textPrimary }}>
                            {entry?.label || event.name}
                        </h3>
                        <EventCategoryTag category={event.category} />
                    </div>
                </div>
                {/* Status badge */}
                <span
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                    }}
                >
                    {event.status === 'IN_PROGRESS' && (
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: statusStyle.dot }} />
                    )}
                    {statusStyle.label}
                </span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: theme.textMuted }}>
                {event.date && (
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(event.date)}
                    </span>
                )}
                {event.venue && (
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.venue}
                    </span>
                )}
                {entry?.metric && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {entry.metric}
                    </span>
                )}
            </div>

            {/* Results podium (if completed) */}
            {event.status === 'COMPLETED' && topResults.length > 0 && (
                <div className="rounded-lg p-2.5 space-y-1.5" style={{ backgroundColor: theme.bgPrimary }}>
                    {topResults.map((r, i) => {
                        const dept = r.department;
                        return (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span>{MEDALS[i] || `#${r.position}`}</span>
                                    <span className="font-semibold" style={{ color: theme.textPrimary }}>
                                        {dept?.shortCode || dept?.name || 'TBD'}
                                    </span>
                                    {r.participant && (
                                        <span style={{ color: theme.textMuted }}>• {r.participant}</span>
                                    )}
                                </div>
                                {r.score && (
                                    <span className="font-mono font-medium" style={{ color: theme.accent }}>
                                        {r.score}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Points awarded badge */}
            {event.pointsAwarded && (
                <div className="flex items-center gap-1 mt-2 text-[10px] font-medium" style={{ color: theme.accent }}>
                    <Trophy className="w-3 h-3" /> Points Awarded
                </div>
            )}
        </motion.div>
    );
};

export default EventCard;
