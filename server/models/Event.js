const mongoose = require('mongoose');
const { getEventSportIds, EVENT_CATEGORIES } = require('../config/sportsRegistry');

const EVENT_STATUS = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const VALID_CATEGORIES = ['ATHLETICS_TRACK', 'ATHLETICS_FIELD', 'AQUATICS', 'ENDURANCE', 'INDOOR', 'CULTURAL', 'ART', 'LITERARY', 'OTHER'];

const resultSchema = new mongoose.Schema({
    position: { type: Number, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    participant: { type: String, default: '' },
    score: { type: String, default: '' },
    points: { type: Number, default: 0 },
}, { _id: false });

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
    },
    sport: {
        type: String,
        required: [true, 'Sport/event ID is required'],
        validate: {
            validator: function(v) {
                return getEventSportIds().includes(v);
            },
            message: props => `${props.value} is not a valid event sport`
        }
    },
    category: {
        type: String,
        required: true,
        enum: VALID_CATEGORIES,
    },
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season',
        default: null,
    },
    status: {
        type: String,
        enum: EVENT_STATUS,
        default: 'UPCOMING',
    },
    date: { type: Date, default: null },
    venue: { type: String, default: '' },
    description: { type: String, default: '' },

    // Results — flexible for all event types
    results: [resultSchema],

    // Metric info (from registry, stored for convenience)
    metric: { type: String, default: null },

    judges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],

    // Idempotency flag — prevents awarding points twice
    pointsAwarded: { type: Boolean, default: false },

    notes: { type: String, default: '' },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
    },
}, {
    timestamps: true,
});

// ── Indexes ──
eventSchema.index({ category: 1, status: 1, date: -1 });
eventSchema.index({ sport: 1, status: 1 });
eventSchema.index({ status: 1, date: -1, _id: -1 });
eventSchema.index({ season: 1, category: 1 });
eventSchema.index({ date: -1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = { Event, EVENT_STATUS, VALID_CATEGORIES };
