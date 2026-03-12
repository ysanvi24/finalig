const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { processUpload } = require('../middleware/uploadMiddleware');
const {
    getAllMembers,
    getMember,
    addMember,
    updateMember,
    deleteMember
} = require('../controllers/studentCouncilController');

// Public routes
router.get('/', getAllMembers);
router.get('/:id', getMember);

// Protected admin routes — support photo file upload
router.post('/', protect, upload.single('photo'), processUpload, addMember);
router.put('/:id', protect, upload.single('photo'), processUpload, updateMember);
router.delete('/:id', protect, deleteMember);

module.exports = router;
