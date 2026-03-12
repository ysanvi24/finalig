const express = require('express');
const router = express.Router();
const {
    createEvent,
    getAllEvents,
    getEvent,
    updateEvent,
    recordResults,
    awardEventPoints,
    assignRanks,
    deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEvent);

// Protected routes (Admin only)
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.put('/:id/results', protect, recordResults);
router.post('/:id/award', protect, awardEventPoints);
router.post('/:id/assign-ranks', protect, assignRanks);   // ← NEW: one-click GROUP event ranking
router.delete('/:id', protect, deleteEvent);

module.exports = router;
