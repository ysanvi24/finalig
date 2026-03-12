/**
 * OfficialEvent — Mongoose model for the 78 official IG events.
 * Seeded from scoringTable.js. Read-only in production; admins cannot mutate points.
 */
const mongoose = require('mongoose');

const officialEventSchema = new mongoose.Schema({
  eventNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 78,
  },
  name: { type: String, required: true },
  sportId: { type: String, required: true },
  /** BRACKET = 1v1 QF→SF→LM→Final; GROUP = admin assigns ranks 1-8 directly */
  type: { type: String, enum: ['BRACKET', 'GROUP'], required: true },
  venue: { type: String, default: '' },
  category: { type: String, default: '' },
  notes: { type: String, default: '' },
  /**
   * Points per position.
   * Key = position (1-8), Value = points awarded.
   * e.g. { "1": 50, "2": 35, "3": 20, "4": 10, "5": 0, ... }
   */
  positions: {
    type: Map,
    of: Number,
    required: true,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

officialEventSchema.index({ type: 1 });
officialEventSchema.index({ category: 1 });
officialEventSchema.index({ sportId: 1 });

const OfficialEvent = mongoose.model('OfficialEvent', officialEventSchema);
module.exports = OfficialEvent;
