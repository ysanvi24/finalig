import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import axiosInst from '../../api/axios';
import { fetchEvents, createEvent as apiCreateEvent, updateEvent as apiUpdateEvent, recordResults as apiRecordResults, awardEventPoints as apiAwardPoints, deleteEvent as apiDeleteEvent } from '../../api/eventApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Save, X, Trash2, Trophy, Award, Edit3, CheckCircle, AlertCircle, Calendar, MapPin } from 'lucide-react';
import { EVENT_SPORTS, EVENT_CATEGORIES, getEntry } from '../../config/sportsRegistry';
import { EventCategoryTag } from '../../components/EventBadge';
import socket from '../../socket';

const STATUS_OPTIONS = [
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

const EventManager = () => {
    const [events, setEvents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('manage'); // create | manage | results
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Create form
    const [createForm, setCreateForm] = useState({ sport: '', category: '', date: '', venue: '', description: '' });
    const [creating, setCreating] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    // Award results/points
    const [resultsId, setResultsId] = useState(null);
    const [resultsForm, setResultsForm] = useState([]);
    const [savingResults, setSavingResults] = useState(false);

    // Official Ranks state (GROUP events)
    const [officialEvents, setOfficialEvents] = useState([]);
    const [ranksEventId, setRanksEventId] = useState(null);
    const [ranksOfficialNumber, setRanksOfficialNumber] = useState('');
    const [ranksForm, setRanksForm] = useState(Array.from({ length: 8 }, (_, i) => ({ position: i + 1, department: '', points: 0 })));
    const [savingRanks, setSavingRanks] = useState(false);
    const [officialLoading, setOfficialLoading] = useState(false);

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [evRes, deptRes] = await Promise.all([
                fetchEvents({ limit: 300 }),
                api.get('/departments'),
            ]);
            setEvents(evRes.data || []);
            setDepartments(deptRes.data.data || deptRes.data || []);
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Socket listeners
    useEffect(() => {
        const handleCreated = (ev) => {
            if (!ev?._id) return;
            setEvents(prev => prev.some(e => e._id === ev._id) ? prev : [ev, ...prev]);
        };
        const handleUpdate = (ev) => {
            if (!ev?._id) return;
            setEvents(prev => prev.map(e => e._id === ev._id ? { ...e, ...ev } : e));
        };
        const handleDeleted = (data) => {
            const id = data?.eventId || data?._id;
            if (id) setEvents(prev => prev.filter(e => e._id !== id));
        };

        socket.on('eventCreated', handleCreated);
        socket.on('eventUpdate', handleUpdate);
        socket.on('eventResult', handleUpdate);
        socket.on('eventDeleted', handleDeleted);
        return () => {
            socket.off('eventCreated', handleCreated);
            socket.off('eventUpdate', handleUpdate);
            socket.off('eventResult', handleUpdate);
            socket.off('eventDeleted', handleDeleted);
        };
    }, []);

    // Filter events
    const filteredEvents = events.filter(e => {
        if (filterCategory !== 'ALL' && e.category !== filterCategory) return false;
        if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!e.name?.toLowerCase().includes(q) && !e.sport?.toLowerCase().includes(q)) return false;
        }
        return true;
    });

    // ── Create Event ──
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!createForm.sport || !createForm.category) {
            toast.error('Select an event type');
            return;
        }
        setCreating(true);
        try {
            const entry = getEntry(createForm.sport);
            await apiCreateEvent({
                name: entry?.label || createForm.sport,
                sport: createForm.sport,
                category: createForm.category,
                date: createForm.date || null,
                venue: createForm.venue || '',
                description: createForm.description || '',
                metric: entry?.metric || null,
            });
            toast.success('Event created!');
            setCreateForm({ sport: '', category: '', date: '', venue: '', description: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create event');
        } finally {
            setCreating(false);
        }
    };

    // When sport is selected in create form, auto-fill category
    const handleSportChange = (sportId) => {
        const entry = EVENT_SPORTS.find(s => s.id === sportId);
        setCreateForm(prev => ({
            ...prev,
            sport: sportId,
            category: entry?.category || prev.category,
        }));
    };

    // ── Inline Edit ──
    const startEdit = (ev) => {
        setEditingId(ev._id);
        setEditForm({ status: ev.status, venue: ev.venue || '', date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '', description: ev.description || '' });
    };

    const saveEdit = async (evId) => {
        setSaving(true);
        try {
            await apiUpdateEvent(evId, editForm);
            toast.success('Event updated');
            setEditingId(null);
        } catch (err) {
            toast.error('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ──
    const handleDelete = async (evId) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await apiDeleteEvent(evId);
            toast.success('Event deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    // ── Results ──
    const startResults = (ev) => {
        setResultsId(ev._id);
        if (ev.results && ev.results.length > 0) {
            setResultsForm(ev.results.map(r => ({
                position: r.position,
                department: r.department?._id || r.department || '',
                participant: r.participant || '',
                score: r.score || '',
                points: r.points || 0,
            })));
        } else {
            setResultsForm([
                { position: 1, department: '', participant: '', score: '', points: 10 },
                { position: 2, department: '', participant: '', score: '', points: 7 },
                { position: 3, department: '', participant: '', score: '', points: 5 },
            ]);
        }
    };

    const addResultRow = () => {
        const nextPos = resultsForm.length + 1;
        setResultsForm(prev => [...prev, { position: nextPos, department: '', participant: '', score: '', points: 1 }]);
    };

    const updateResultRow = (idx, field, value) => {
        setResultsForm(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const saveResults = async () => {
        const valid = resultsForm.filter(r => r.department);
        if (valid.length === 0) { toast.error('Add at least one result'); return; }
        setSavingResults(true);
        try {
            await apiRecordResults(resultsId, valid);
            toast.success('Results recorded!');
            setResultsId(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save results');
        } finally {
            setSavingResults(false);
        }
    };

    // ── Award Points ──
    const handleAward = async (evId) => {
        if (!window.confirm('Award points for this event? This cannot be undone.')) return;
        try {
            const res = await apiAwardPoints(evId);
            toast.success(res.message || 'Points awarded!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to award points');
        }
    };

    // ── Official GROUP Ranks ──
    const loadOfficialEvents = async () => {
        if (officialEvents.length > 0) return;
        setOfficialLoading(true);
        try {
            const res = await axiosInst.get('/official-events?type=GROUP');
            setOfficialEvents(res.data.data || []);
        } catch {
            toast.error('Failed to load official events');
        } finally {
            setOfficialLoading(false);
        }
    };

    const startRanks = async (ev) => {
        setRanksEventId(ev._id);
        setRanksOfficialNumber('');
        setRanksForm(Array.from({ length: 8 }, (_, i) => ({ position: i + 1, department: '', points: 0 })));
        await loadOfficialEvents();
    };

    const handleOfficialNumberChange = (num) => {
        setRanksOfficialNumber(num);
        const offEv = officialEvents.find(e => e.eventNumber === Number(num));
        if (!offEv) return;
        setRanksForm(prev => prev.map(r => ({
            ...r,
            points: offEv.positions?.[String(r.position)] ?? offEv.positions?.[r.position] ?? 0,
        })));
    };

    const saveRanks = async () => {
        const filled = ranksForm.filter(r => r.department);
        if (filled.length === 0) { toast.error('Assign at least 1 rank'); return; }
        if (!ranksOfficialNumber) { toast.error('Select an official event number'); return; }
        setSavingRanks(true);
        try {
            await axiosInst.post(`/events/${ranksEventId}/assign-ranks`, {
                ranks: filled.map(r => ({ department: r.department, position: r.position })),
                officialEventNumber: Number(ranksOfficialNumber),
            });
            toast.success('Ranks assigned & points awarded!');
            setRanksEventId(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to assign ranks');
        } finally {
            setSavingRanks(false);
        }
    };

    // ── Grouped event options for dropdown ──
    const groupedEvents = EVENT_CATEGORIES.filter(c => c.id !== 'ALL').map(cat => ({
        label: cat.label,
        events: EVENT_SPORTS.filter(s => s.category === cat.id),
    }));

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-3 sm:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-[var(--color-accent)]" />
                        Event Manager
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Manage events, record results, award points</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-xl p-1 mb-6 bg-[var(--bg-tertiary)]">
                    {[
                        { key: 'manage', label: '📋 Manage' },
                        { key: 'create', label: '➕ Create' },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══ CREATE TAB ═══ */}
                {activeTab === 'create' && (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 sm:p-6">
                        <form onSubmit={handleCreate} className="space-y-5">
                            {/* Event Type */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Event Type</label>
                                <select value={createForm.sport} onChange={(e) => handleSportChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm">
                                    <option value="">Select event...</option>
                                    {groupedEvents.map(g => (
                                        <optgroup key={g.label} label={g.label}>
                                            {g.events.map(ev => (
                                                <option key={ev.id} value={ev.id}>{ev.label}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Venue
                                    </label>
                                    <input type="text" value={createForm.venue} onChange={(e) => setCreateForm(p => ({ ...p, venue: e.target.value }))}
                                        placeholder="e.g. Main Ground"
                                        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Date & Time
                                    </label>
                                    <input type="datetime-local" value={createForm.date} onChange={(e) => setCreateForm(p => ({ ...p, date: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
                                <textarea value={createForm.description} onChange={(e) => setCreateForm(p => ({ ...p, description: e.target.value }))}
                                    rows="2" placeholder="Rules, format info..."
                                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-accent)] outline-none text-sm resize-none" />
                            </div>

                            <button type="submit" disabled={creating || !createForm.sport}
                                className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                                    creating || !createForm.sport ? 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed' : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--bg-primary)]'
                                }`}>
                                {creating ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Event</>}
                            </button>
                        </form>
                    </div>
                )}

                {/* ═══ MANAGE TAB ═══ */}
                {activeTab === 'manage' && (
                    <>
                        {/* Filters */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-2 flex-1 min-w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2">
                                <Search className="w-4 h-4 text-[var(--text-muted)]" />
                                <input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 outline-none text-sm text-[var(--text-primary)] placeholder-slate-400 bg-transparent" />
                            </div>
                            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] outline-none">
                                <option value="ALL">All Categories</option>
                                {EVENT_CATEGORIES.filter(c => c.id !== 'ALL').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-secondary)] outline-none">
                                <option value="ALL">All Status</option>
                                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="p-3 rounded-lg border text-center bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--border-color)]">
                                <div className="text-2xl font-bold">{events.length}</div>
                                <div className="text-xs font-medium">Total</div>
                            </div>
                            <div className="p-3 rounded-lg border text-center bg-[rgba(251,191,36,0.1)] text-amber-400 border-[rgba(251,191,36,0.2)]">
                                <div className="text-2xl font-bold">{events.filter(e => e.status === 'UPCOMING').length}</div>
                                <div className="text-xs font-medium">Upcoming</div>
                            </div>
                            <div className="p-3 rounded-lg border text-center bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.2)]">
                                <div className="text-2xl font-bold">{events.filter(e => e.status === 'COMPLETED').length}</div>
                                <div className="text-xs font-medium">Completed</div>
                            </div>
                        </div>

                        {/* Event List */}
                        {loading ? (
                            <div className="text-center py-12 text-[var(--text-muted)]">Loading events...</div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="text-center py-12 text-[var(--text-muted)]">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No events found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {filteredEvents.map(ev => {
                                        const entry = getEntry(ev.sport);
                                        const isEditing = editingId === ev._id;
                                        const isResults = resultsId === ev._id;

                                        return (
                                            <motion.div key={ev._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                                                {/* Event Row */}
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <EventCategoryTag category={ev.category} />
                                                            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{entry?.label || ev.name}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                                                ev.status === 'COMPLETED' ? 'bg-[rgba(74,222,128,0.1)] text-[#4ade80] border-[rgba(74,222,128,0.2)]' :
                                                                ev.status === 'IN_PROGRESS' ? 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.2)]' :
                                                                ev.status === 'CANCELLED' ? 'bg-[rgba(248,113,113,0.1)] text-[#f87171] border-[rgba(248,113,113,0.2)]' :
                                                                'bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border-[rgba(251,191,36,0.2)]'
                                                            }`}>{ev.status?.replace('_', ' ')}</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => isEditing ? setEditingId(null) : startEdit(ev)}
                                                                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                                                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                                            </button>
                                                            <button onClick={() => isResults ? setResultsId(null) : startResults(ev)}
                                                                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                                                                <Award className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => ranksEventId === ev._id ? setRanksEventId(null) : startRanks(ev)}
                                                                className={`p-2 rounded-lg transition-colors ${ranksEventId === ev._id ? 'bg-purple-500/10 text-purple-400' : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
                                                                title="Assign Official Ranks">
                                                                <Trophy className="w-4 h-4" />
                                                            </button>
                                                            {ev.results?.length > 0 && !ev.pointsAwarded && (
                                                                <button onClick={() => handleAward(ev._id)}
                                                                    className="p-2 rounded-lg hover:bg-[rgba(74,222,128,0.1)] text-green-400" title="Award Points">
                                                                    <Trophy className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleDelete(ev._id)}
                                                                className="p-2 rounded-lg hover:bg-[rgba(248,113,113,0.1)] text-red-400">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 text-xs text-[var(--text-muted)]">
                                                        {ev.venue && <span>📍 {ev.venue}</span>}
                                                        {ev.date && <span>📅 {new Date(ev.date).toLocaleDateString()}</span>}
                                                        {ev.results?.length > 0 && <span>🏆 {ev.results.length} results</span>}
                                                        {ev.pointsAwarded && <span className="text-green-400">✅ Awarded</span>}
                                                    </div>
                                                </div>

                                                {/* Edit Form */}
                                                <AnimatePresence>
                                                    {isEditing && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-[var(--border-color)] overflow-hidden">
                                                            <div className="p-4 bg-[var(--bg-primary)] space-y-3">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Status</label>
                                                                        <select value={editForm.status} onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))}
                                                                            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none">
                                                                            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Venue</label>
                                                                        <input type="text" value={editForm.venue} onChange={(e) => setEditForm(p => ({ ...p, venue: e.target.value }))}
                                                                            className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date & Time</label>
                                                                    <input type="datetime-local" value={editForm.date} onChange={(e) => setEditForm(p => ({ ...p, date: e.target.value }))}
                                                                        className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm outline-none" />
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => saveEdit(ev._id)} disabled={saving}
                                                                        className="flex-1 py-2 bg-[#4ade80] text-[var(--text-primary)] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                                                                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                                                                    </button>
                                                                    <button onClick={() => setEditingId(null)}
                                                                        className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium">
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Results Form */}
                                                <AnimatePresence>
                                                    {isResults && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-[var(--border-color)] overflow-hidden">
                                                            <div className="p-4 bg-[var(--bg-primary)] space-y-3">
                                                                <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                                                                    <Award className="w-4 h-4 text-[var(--color-accent)]" /> Record Results
                                                                </h4>
                                                                {resultsForm.map((r, idx) => (
                                                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                                        <div className="col-span-1 text-center text-sm font-bold text-[var(--text-primary)]">
                                                                            {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${r.position}`}
                                                                        </div>
                                                                        <select value={r.department} onChange={(e) => updateResultRow(idx, 'department', e.target.value)}
                                                                            className="col-span-3 px-2 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs outline-none">
                                                                            <option value="">Dept</option>
                                                                            {departments.map(d => <option key={d._id} value={d._id}>{d.shortCode}</option>)}
                                                                        </select>
                                                                        <input type="text" value={r.participant} onChange={(e) => updateResultRow(idx, 'participant', e.target.value)}
                                                                            placeholder="Name" className="col-span-3 px-2 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs outline-none" />
                                                                        <input type="text" value={r.score} onChange={(e) => updateResultRow(idx, 'score', e.target.value)}
                                                                            placeholder="Score" className="col-span-2 px-2 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs outline-none" />
                                                                        <input type="number" value={r.points} onChange={(e) => updateResultRow(idx, 'points', Number(e.target.value))}
                                                                            placeholder="Pts" className="col-span-2 px-2 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs outline-none" />
                                                                        <button onClick={() => setResultsForm(prev => prev.filter((_, i) => i !== idx))}
                                                                            className="col-span-1 p-1 text-red-400 hover:text-red-300">
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                <button onClick={addResultRow}
                                                                    className="w-full py-1.5 border border-dashed border-[var(--border-color)] rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                                                                    + Add Position
                                                                </button>
                                                                <div className="flex gap-2">
                                                                    <button onClick={saveResults} disabled={savingResults}
                                                                        className="flex-1 py-2 bg-[var(--color-accent)] text-[var(--bg-primary)] rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                                                                        <Save className="w-3.5 h-3.5" /> {savingResults ? 'Saving...' : 'Save Results'}
                                                                    </button>
                                                                    <button onClick={() => setResultsId(null)}
                                                                        className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium">
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                {/* Official Ranks Panel */}
                                                <AnimatePresence>
                                                    {ranksEventId === ev._id && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                            className="border-t border-[var(--border-color)] overflow-hidden">
                                                            <div className="p-4 bg-[var(--bg-primary)] space-y-3">
                                                                <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                                                                    <Trophy className="w-4 h-4 text-purple-400" /> Assign Official Ranks (Auto Points)
                                                                </h4>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Official Event # (for points lookup)</label>
                                                                    <select value={ranksOfficialNumber} onChange={e => handleOfficialNumberChange(e.target.value)}
                                                                        className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs outline-none">
                                                                        <option value="">Select official event…</option>
                                                                        {officialLoading && <option disabled>Loading…</option>}
                                                                        {officialEvents.map(oe => (
                                                                            <option key={oe.eventNumber} value={oe.eventNumber}>#{oe.eventNumber} — {oe.name}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                {ranksForm.map((r, idx) => (
                                                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                                        <div className="col-span-1 text-center text-sm font-bold text-[var(--text-primary)]">
                                                                            {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${r.position}`}
                                                                        </div>
                                                                        <select value={r.department} onChange={e => setRanksForm(prev => prev.map((x, i) => i === idx ? { ...x, department: e.target.value } : x))}
                                                                            className="col-span-6 px-2 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs outline-none">
                                                                            <option value="">Dept (optional)</option>
                                                                            {departments.map(d => <option key={d._id} value={d._id}>{d.shortCode}</option>)}
                                                                        </select>
                                                                        <div className="col-span-5 text-right text-xs font-bold text-purple-400">
                                                                            {r.points > 0 ? `${r.points} pts` : '—'}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="flex gap-2 mt-2">
                                                                    <button onClick={saveRanks} disabled={savingRanks}
                                                                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                                                                        <Save className="w-3.5 h-3.5" /> {savingRanks ? 'Saving…' : 'Assign & Award'}
                                                                    </button>
                                                                    <button onClick={() => setRanksEventId(null)}
                                                                        className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg text-sm font-medium">
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EventManager;
