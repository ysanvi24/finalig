const mongoose = require('mongoose');
const { getAllSportIds } = require('../config/sportsRegistry');

const scoringPresetSchema = new mongoose.Schema({
    sport: {
        type: String,
        required: [true, 'Sport is required'],
        validate: {
            validator: function(v) {
                return getAllSportIds().includes(v);
            },
            message: props => `${props.value} is not a valid sport`
        }
    },
    name: {
        type: String,
        default: 'standard',
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    // Points configuration
    winPoints: {
        type: Number,
        required: true,
        default: 10
    },
    lossPoints: {
        type: Number,
        required: true,
        default: 0
    },
    drawPoints: {
        type: Number,
        required: true,
        default: 5
    },
    // Bonus multipliers
    bonusPoints: {
        type: Number,
        default: 0,
        description: 'Extra points for dominant victory'
    },
    dominantVictoryMargin: {
        type: Number,
        default: null,
        description: 'Goal/score difference to qualify for bonus'
    },
    // Match type multipliers
    matchTypeMultipliers: {
        regular: { type: Number, default: 1 },
        semifinal: { type: Number, default: 1.5 },
        final: { type: Number, default: 2 }
    },
    // Sport-specific rules
    sportSpecificRules: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create compound index for unique sport+name combination
scoringPresetSchema.index({ sport: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ScoringPreset', scoringPresetSchema);
