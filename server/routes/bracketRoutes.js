const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  startBracket,
  completeMatch,
  awardBracketPoints,
  getBracket,
  resetBracket,
  listBrackets,
} = require('../controllers/bracketController');

// Public
router.get('/', listBrackets);
router.get('/:eventNumber', getBracket);

// Protected (Admin)
router.post('/:eventNumber/start', protect, startBracket);
router.post('/:eventNumber/award', protect, awardBracketPoints);
router.delete('/:eventNumber/reset', protect, resetBracket);
router.post('/match/:matchId/complete', protect, completeMatch);

module.exports = router;
