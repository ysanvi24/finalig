const asyncHandler = require('express-async-handler');
const { Event } = require('../models/Event');
const { isEventSport, getEntry } = require('../config/sportsRegistry');
const OfficialEvent = require('../models/OfficialEvent');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin)
const createEvent = asyncHandler(async (req, res) => {
    const { name, sport, category, date, venue, description, season, metric, notes } = req.body;

    if (!name || !sport || !category) {
        res.status(400);
        throw new Error('Name, sport, and category are required');
    }

    if (!isEventSport(sport)) {
        res.status(400);
        throw new Error(`${sport} is not a valid event sport`);
    }

    const entry = getEntry(sport);

    const event = await Event.create({
        name,
        sport,
        category,
        date: date || null,
        venue: venue || '',
        description: description || '',
        season: season || null,
        metric: metric || entry?.metric || null,
        notes: notes || '',
        createdBy: req.admin?._id || null,
    });

    const populated = await Event.findById(event._id)
        .populate('results.department', 'name shortCode logo')
        .lean();

    const io = req.app.get('io');
    if (io) io.emit('eventCreated', populated);

    res.status(201).json({ success: true, data: populated });
});

// @desc    Get all events (with filters)
// @route   GET /api/events
// @access  Public
const getAllEvents = asyncHandler(async (req, res) => {
    const { category, status, search, season, limit = 100, page = 1 } = req.query;

    const filter = {};
    if (category && category !== 'ALL') filter.category = category;
    if (status && status !== 'ALL') filter.status = status;
    if (season) filter.season = season;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sport: { $regex: search, $options: 'i' } },
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
        Event.find(filter)
            .populate('results.department', 'name shortCode logo')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Event.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: events,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
    });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('results.department', 'name shortCode logo')
        .populate('judges', 'username role')
        .populate('createdBy', 'username')
        .lean();

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    res.json({ success: true, data: event });
});

// @desc    Update event details
// @route   PUT /api/events/:id
// @access  Private (Admin)
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const allowedFields = ['name', 'date', 'venue', 'description', 'status', 'notes', 'metric', 'season'];
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    await event.save();

    const populated = await Event.findById(event._id)
        .populate('results.department', 'name shortCode logo')
        .lean();

    const io = req.app.get('io');
    if (io) io.emit('eventUpdate', populated);

    res.json({ success: true, data: populated });
});

// @desc    Record results for an event
// @route   PUT /api/events/:id/results
// @access  Private (Admin)
const recordResults = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const { results } = req.body;
    if (!results || !Array.isArray(results) || results.length === 0) {
        res.status(400);
        throw new Error('Results array is required');
    }

    // Validate each result entry
    for (const r of results) {
        if (!r.position || !r.department) {
            res.status(400);
            throw new Error('Each result needs a position and department');
        }
    }

    event.results = results;
    if (event.status === 'UPCOMING' || event.status === 'IN_PROGRESS') {
        event.status = 'COMPLETED';
    }

    await event.save();

    const populated = await Event.findById(event._id)
        .populate('results.department', 'name shortCode logo')
        .lean();

    const io = req.app.get('io');
    if (io) io.emit('eventResult', populated);

    res.json({ success: true, data: populated });
});

// @desc    Award points from event results (idempotent)
// @route   POST /api/events/:id/award
// @access  Private (Admin)
const awardEventPoints = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate('results.department', 'name shortCode');

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (event.pointsAwarded) {
        res.status(400);
        throw new Error('Points have already been awarded for this event');
    }

    if (!event.results || event.results.length === 0) {
        res.status(400);
        throw new Error('No results recorded for this event');
    }

    // Create point logs for each result
    const PointLog = require('../models/PointLog');
    const pointLogs = [];

    // Map category to PointLog category
    const categoryMap = {
        'ATHLETICS_TRACK': 'Sports', 'ATHLETICS_FIELD': 'Sports', 'AQUATICS': 'Sports',
        'ENDURANCE': 'Sports', 'INDOOR': 'Sports',
        'CULTURAL': 'Cultural', 'ART': 'Arts', 'LITERARY': 'Literary', 'OTHER': 'Other',
    };

    for (const result of event.results) {
        if (result.points > 0 && result.department) {
            const log = await PointLog.create({
                department: result.department._id || result.department,
                points: result.points,
                category: categoryMap[event.category] || 'Other',
                eventName: event.name,
                position: result.position === 1 ? 'Winner' : result.position === 2 ? 'Runner-up' : result.position === 3 ? '2nd Runner-up' : 'Participation',
                description: `${event.name} - Position ${result.position}${result.score ? ` (${result.score})` : ''}`,
                awardedBy: req.admin?._id || null,
            });
            pointLogs.push(log);
        }
    }

    event.pointsAwarded = true;
    await event.save();

    // Clear leaderboard cache
    const { clearCache } = require('../utils/cache');
    if (clearCache) clearCache();

    const io = req.app.get('io');
    if (io) io.emit('eventUpdate', { _id: event._id, pointsAwarded: true });
    if (io) io.emit('leaderboardUpdate', { source: 'event', eventId: event._id });

    res.json({
        success: true,
        message: `Awarded points for ${pointLogs.length} placements`,
        pointLogs: pointLogs.length,
    });
});

// @desc    Assign ranks (1-8) for a GROUP event and auto-award points from official scoring table.
//          This is the recommended one-click flow for events 20-78.
// @route   POST /api/events/:id/assign-ranks
// @body    { eventNumber: Number, ranks: [{ department: ObjectId, position: 1-8 }] }
// @access  Private (Admin)
const assignRanks = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404); throw new Error('Event not found'); }

    if (event.pointsAwarded) {
        res.status(400); throw new Error('Points already awarded for this event. Reset first.');
    }

    const { eventNumber, ranks } = req.body;
    if (!eventNumber) { res.status(400); throw new Error('eventNumber is required'); }
    if (!ranks || !Array.isArray(ranks) || ranks.length === 0) {
        res.status(400); throw new Error('ranks array is required: [{ department, position }]');
    }

    // Load official event to get scoring table
    const officialEvent = await OfficialEvent.findOne({ eventNumber: Number(eventNumber) });
    if (!officialEvent) { res.status(404); throw new Error(`Official event #${eventNumber} not found`); }
    if (officialEvent.type !== 'GROUP') {
        res.status(400); throw new Error(`Event #${eventNumber} is a BRACKET event — use /api/brackets instead`);
    }

    // Validate and build results from scoring table
    const positionsMap = officialEvent.positions instanceof Map
        ? officialEvent.positions
        : new Map(Object.entries(officialEvent.positions));

    const results = [];
    for (const r of ranks) {
        if (!r.department || !r.position) {
            res.status(400); throw new Error('Each rank entry needs department and position (1-8)');
        }
        const pos = Number(r.position);
        if (pos < 1 || pos > 8) { res.status(400); throw new Error(`Position must be 1-8, got ${pos}`); }
        const pts = Number(positionsMap.get(String(pos)) ?? 0);
        results.push({
            position: pos,
            department: r.department,
            participant: r.participant || '',
            score: r.score || '',
            points: pts, // auto-filled from official table
        });
    }

    // Sort by position
    results.sort((a, b) => a.position - b.position);

    // Save results to event
    event.results = results;
    if (event.status === 'UPCOMING' || event.status === 'IN_PROGRESS') {
        event.status = 'COMPLETED';
    }
    await event.save();

    // Award PointLogs
    const PointLog = require('../models/PointLog');
    const categoryMap = {
        'ATHLETICS_TRACK': 'Sports', 'ATHLETICS_FIELD': 'Sports', 'AQUATICS': 'Sports',
        'ENDURANCE': 'Sports', 'INDOOR': 'Sports', 'ESPORTS': 'Sports',
        'CULTURAL': 'Cultural', 'ART': 'Arts', 'LITERARY': 'Literary', 'OTHER': 'Other',
        'TEAM_SPORT': 'Sports',
    };
    const posLabels = { 1: 'Winner', 2: 'Runner-up', 3: '2nd Runner-up', 4: '4th Place' };
    const logCategory = categoryMap[officialEvent.category] || 'Other';
    const pointLogs = [];

    for (const r of results) {
        if (r.points > 0) {
            const log = await PointLog.create({
                department: r.department,
                points: r.points,
                category: logCategory,
                eventName: officialEvent.name,
                position: posLabels[r.position] || `Position ${r.position}`,
                description: `${officialEvent.name} — Event #${eventNumber} (Position ${r.position})`,
                awardedBy: req.admin?._id || null,
            });
            pointLogs.push(log);
        }
    }

    event.pointsAwarded = true;
    await event.save();

    const { clearCache } = require('../utils/cache');
    if (clearCache) clearCache();

    const io = req.app.get('io');
    if (io) io.emit('eventUpdate', { _id: event._id, pointsAwarded: true });
    if (io) io.emit('leaderboardUpdate', { source: 'groupEvent', eventId: event._id, eventNumber });

    res.json({
        success: true,
        message: `Ranks assigned and ${pointLogs.length} point logs created for ${officialEvent.name}`,
        pointsAwarded: pointLogs.map(l => ({ department: l.department, points: l.points })),
    });
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    await event.deleteOne();

    const io = req.app.get('io');
    if (io) io.emit('eventDeleted', { eventId: req.params.id });

    res.json({ success: true, message: 'Event deleted' });
});

module.exports = {
    createEvent,
    getAllEvents,
    getEvent,
    updateEvent,
    recordResults,
    awardEventPoints,
    assignRanks,
    deleteEvent,
};
