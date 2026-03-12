const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const OfficialEvent = require('../models/OfficialEvent');
const { SCORING_TABLE } = require('../config/scoringTable');

// @desc    Get all 78 official events (with optional type/category filter)
// @route   GET /api/official-events
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { type, category } = req.query;
  const filter = { isActive: true };
  if (type) filter.type = type;
  if (category) filter.category = category;

  const events = await OfficialEvent.find(filter)
    .sort({ eventNumber: 1 })
    .lean();

  res.json({ success: true, data: events, total: events.length });
}));

// @desc    Get a single official event by eventNumber
// @route   GET /api/official-events/:eventNumber
// @access  Public
router.get('/:eventNumber', asyncHandler(async (req, res) => {
  const ev = await OfficialEvent.findOne({ eventNumber: Number(req.params.eventNumber) }).lean();
  if (!ev) {
    res.status(404);
    throw new Error(`Official event #${req.params.eventNumber} not found`);
  }
  res.json({ success: true, data: ev });
}));

// @desc    (Internal) Return the raw scoring table from config (no DB needed)
// @route   GET /api/official-events/config/table
// @access  Public
router.get('/config/table', (req, res) => {
  res.json({ success: true, data: SCORING_TABLE, total: SCORING_TABLE.length });
});

module.exports = router;
