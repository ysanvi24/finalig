import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, MapPin, Calendar, Clock, Award, Users, FileText } from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import EventBadge, { EventCategoryTag } from '../../components/EventBadge';
import { useTheme } from '../../context/ThemeContext';
import { fetchEvent } from '../../api/eventApi';
import { getEntry } from '../../config/sportsRegistry';
import socket from '../../socket';

const MEDALS = ['🥇', '🥈', '🥉'];

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const res = await fetchEvent(id);
            setEvent(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Event not found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvent();
        const handleUpdate = (data) => {
            if (data?._id === id) loadEvent();
        };
        const handleResult = (data) => {
            if (data?._id === id) loadEvent();
        };
        socket.on('eventUpdate', handleUpdate);
        socket.on('eventResult', handleResult);
        return () => {
            socket.off('eventUpdate', handleUpdate);
            socket.off('eventResult', handleResult);
        };
    }, [id]);

    const entry = event ? getEntry(event.sport) : null;

    const statusColors = {
        UPCOMING:    { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
        IN_PROGRESS: { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444' },
        COMPLETED:   { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
        CANCELLED:   { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
    };

    if (loading) return (
        <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />
            <div className="flex items-center justify-center pt-32">
                <div className="w-8 h-8 border-2 rounded-full animate-spin"
                    style={{ borderColor: theme.borderDefault, borderTopColor: theme.accent }} />
            </div>
        </div>
    );

    if (error || !event) return (
        <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />
            <div className="flex flex-col items-center justify-center pt-32">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: theme.bgTertiary }}>
                    <Trophy className="w-7 h-7" style={{ color: theme.textMuted }} />
                </div>
                <p style={{ color: theme.textMuted }}>{error || 'Event not found'}</p>
                <button onClick={() => navigate('/events')} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}>
                    Back to Events
                </button>
            </div>
        </div>
    );

    const sc = statusColors[event.status] || statusColors.UPCOMING;

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />

            <div className="max-w-2xl mx-auto px-4 pt-20 pb-12">
                {/* Back */}
                <button onClick={() => { window.history.length > 1 ? navigate(-1) : navigate('/events'); }}
                    className="flex items-center gap-1.5 text-sm mb-6 transition-colors hover:opacity-80"
                    style={{ color: theme.textMuted }}>
                    <ArrowLeft className="w-4 h-4" /> Back to events
                </button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>

                    {/* Header */}
                    <div className="p-5 text-center"
                        style={{ background: `linear-gradient(135deg, ${entry?.accentColor || theme.accent}, ${entry?.accentColor || theme.accent}cc)` }}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <EventBadge category={event.category} size="md" />
                            <EventCategoryTag category={event.category} />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">{entry?.label || event.name}</h1>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                            {event.status === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            {event.status?.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Info Section */}
                    <div className="p-6 space-y-4">
                        {/* Meta */}
                        <div className="space-y-2.5">
                            {event.date && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                    <Calendar className="w-4 h-4" style={{ color: theme.textMuted }} />
                                    {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            )}
                            {event.venue && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                    <MapPin className="w-4 h-4" style={{ color: theme.textMuted }} />
                                    {event.venue}
                                </div>
                            )}
                            {entry?.metric && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                    <Clock className="w-4 h-4" style={{ color: theme.textMuted }} />
                                    Measured in: {entry.metric}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div className="rounded-xl p-4" style={{ backgroundColor: theme.bgPrimary }}>
                                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold" style={{ color: theme.accent }}>
                                    <FileText className="w-3.5 h-3.5" /> Description
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                                    {event.description}
                                </p>
                            </div>
                        )}

                        {/* Results Table */}
                        {event.results && event.results.length > 0 && (
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: theme.textPrimary }}>
                                    <Award className="w-4 h-4" style={{ color: theme.accent }} />
                                    Results
                                </h3>
                                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.borderDefault}` }}>
                                    {/* Header */}
                                    <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
                                        style={{ backgroundColor: theme.bgTertiary, color: theme.textMuted }}>
                                        <div className="col-span-1">#</div>
                                        <div className="col-span-3">Dept</div>
                                        <div className="col-span-3">Participant</div>
                                        <div className="col-span-3">Score</div>
                                        <div className="col-span-2 text-right">Pts</div>
                                    </div>
                                    {/* Rows */}
                                    {event.results.map((r, i) => {
                                        const dept = r.department;
                                        return (
                                            <div key={i}
                                                className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs items-center"
                                                style={{
                                                    backgroundColor: i % 2 === 0 ? theme.bgSecondary : theme.bgPrimary,
                                                    borderTop: `1px solid ${theme.borderDefault}`,
                                                }}>
                                                <div className="col-span-1 font-bold" style={{ color: theme.textPrimary }}>
                                                    {MEDALS[i] || r.position}
                                                </div>
                                                <div className="col-span-3 font-semibold" style={{ color: theme.textPrimary }}>
                                                    {dept?.shortCode || dept?.name || 'TBD'}
                                                    {dept?.name && dept?.shortCode && (
                                                        <span className="block text-[10px]" style={{ color: theme.textMuted }}>{dept.name}</span>
                                                    )}
                                                </div>
                                                <div className="col-span-3" style={{ color: theme.textSecondary }}>
                                                    {r.participant || '—'}
                                                </div>
                                                <div className="col-span-3 font-mono" style={{ color: theme.accent }}>
                                                    {r.score || '—'}
                                                </div>
                                                <div className="col-span-2 text-right font-bold" style={{ color: r.points > 0 ? '#4ade80' : theme.textMuted }}>
                                                    {r.points > 0 ? `+${r.points}` : '—'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Points Awarded */}
                        {event.pointsAwarded && (
                            <div className="flex items-center justify-center gap-2 py-3 rounded-xl"
                                style={{ backgroundColor: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                                <Trophy className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-semibold text-green-400">Points have been awarded</span>
                            </div>
                        )}

                        {/* Notes */}
                        {event.notes && (
                            <p className="text-xs italic text-center" style={{ color: theme.textMuted }}>
                                {event.notes}
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default EventDetail;
