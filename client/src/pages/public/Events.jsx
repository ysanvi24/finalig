import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trophy, Sparkles, Filter, Calendar, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import EventCard from '../../components/EventCard';
import { EventCategoryTag } from '../../components/EventBadge';
import { useTheme } from '../../context/ThemeContext';
import { fetchEvents } from '../../api/eventApi';
import socket from '../../socket';
import { EVENT_CATEGORIES } from '../../config/sportsRegistry';

const Events = () => {
    const { theme } = useTheme();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch events
    const loadEvents = async () => {
        try {
            setLoading(true);
            const res = await fetchEvents({ limit: 200 });
            setEvents(res.data || []);
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadEvents(); }, []);

    // Real-time socket listeners
    useEffect(() => {
        const handleCreated = (event) => {
            if (!event?._id) return;
            setEvents(prev => {
                if (prev.some(e => e._id === event._id)) return prev;
                return [event, ...prev];
            });
        };
        const handleUpdate = (event) => {
            if (!event?._id) return;
            setEvents(prev => prev.map(e => e._id === event._id ? { ...e, ...event } : e));
        };
        const handleResult = (event) => {
            if (!event?._id) return;
            setEvents(prev => prev.map(e => e._id === event._id ? { ...e, ...event } : e));
        };
        const handleDeleted = (data) => {
            const id = data?.eventId || data?._id;
            if (!id) return;
            setEvents(prev => prev.filter(e => e._id !== id));
        };

        socket.on('eventCreated', handleCreated);
        socket.on('eventUpdate', handleUpdate);
        socket.on('eventResult', handleResult);
        socket.on('eventDeleted', handleDeleted);
        socket.io?.on('reconnect', loadEvents);

        return () => {
            socket.off('eventCreated', handleCreated);
            socket.off('eventUpdate', handleUpdate);
            socket.off('eventResult', handleResult);
            socket.off('eventDeleted', handleDeleted);
            socket.io?.off('reconnect', loadEvents);
        };
    }, []);

    // Filtered events
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
            if (selectedStatus !== 'ALL' && e.status !== selectedStatus) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!e.name?.toLowerCase().includes(q) && !e.sport?.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [events, selectedCategory, selectedStatus, searchQuery]);

    // Stats
    const stats = useMemo(() => ({
        total: events.length,
        upcoming: events.filter(e => e.status === 'UPCOMING').length,
        live: events.filter(e => e.status === 'IN_PROGRESS').length,
        completed: events.filter(e => e.status === 'COMPLETED').length,
    }), [events]);

    // Category counts
    const categoryCounts = useMemo(() => {
        const counts = { ALL: events.length };
        events.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
        return counts;
    }, [events]);

    const EventSkeleton = () => (
        <div className="rounded-xl p-4 animate-pulse" style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
            <div className="flex gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: theme.bgTertiary }} />
                <div className="flex-1">
                    <div className="h-4 w-32 rounded mb-1" style={{ backgroundColor: theme.bgTertiary }} />
                    <div className="h-3 w-20 rounded" style={{ backgroundColor: theme.bgTertiary }} />
                </div>
            </div>
            <div className="h-3 w-40 rounded mb-2" style={{ backgroundColor: theme.bgTertiary }} />
            <div className="h-12 rounded" style={{ backgroundColor: theme.bgTertiary }} />
        </div>
    );

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
            <PublicNavbar />

            <div className="max-w-6xl mx-auto px-4 pt-20 pb-12 space-y-6">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-6 h-6" style={{ color: theme.accent }} />
                        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.textPrimary }}>
                            Events & Competitions
                        </h1>
                    </div>
                    <p className="text-sm max-w-lg mx-auto" style={{ color: theme.textSecondary }}>
                        Athletics, Cultural, Art, Literary & more — track all {events.length}+ events of शाश्वतम् '26
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Total', value: stats.total, color: theme.accent },
                        { label: 'Upcoming', value: stats.upcoming, color: '#fbbf24' },
                        { label: 'Live', value: stats.live, color: '#ef4444' },
                        { label: 'Completed', value: stats.completed, color: '#4ade80' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                            <div className="text-xl sm:text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-[10px] font-medium" style={{ color: theme.textMuted }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.borderDefault}` }}>
                    <Search className="w-4 h-4 flex-shrink-0" style={{ color: theme.textMuted }} />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: theme.textPrimary }}
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {EVENT_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
                            style={selectedCategory === cat.id
                                ? { backgroundColor: theme.accent, color: theme.bgPrimary, boxShadow: `0 2px 8px ${theme.accentSubtle}` }
                                : { backgroundColor: theme.bgSecondary, color: theme.textSecondary, border: `1px solid ${theme.borderDefault}` }
                            }
                        >
                            {cat.label} {categoryCounts[cat.id] ? `(${categoryCounts[cat.id]})` : ''}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: theme.bgTertiary }}>
                    {[
                        { key: 'ALL', label: 'All' },
                        { key: 'UPCOMING', label: 'Upcoming' },
                        { key: 'IN_PROGRESS', label: 'Live' },
                        { key: 'COMPLETED', label: 'Completed' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedStatus(tab.key)}
                            className="flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all"
                            style={selectedStatus === tab.key
                                ? { backgroundColor: theme.bgSecondary, color: theme.textPrimary, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                                : { color: theme.textMuted }
                            }
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.bgTertiary }}>
                            <Trophy className="w-8 h-8" style={{ color: theme.textMuted }} />
                        </div>
                        <h3 className="font-semibold mb-1" style={{ color: theme.textSecondary }}>No events found</h3>
                        <p className="text-sm mb-4" style={{ color: theme.textMuted }}>Try adjusting your filters</p>
                        {(selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
                            <button
                                onClick={() => { setSelectedCategory('ALL'); setSelectedStatus('ALL'); setSearchQuery(''); }}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors active:scale-95"
                                style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredEvents.map((event, i) => (
                                <motion.div
                                    key={event._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                >
                                    <EventCard event={event} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Events;
